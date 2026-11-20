import json
import re
from collections import defaultdict
from contextlib import closing
from datetime import datetime
from uuid import NAMESPACE_URL, uuid5

from flask import Blueprint, g, jsonify, request
from database.db import get_db_connection
from routes.carrito import resumen_carrito

panel = Blueprint("panel", __name__, url_prefix="/api")


def pedido_publico(fila):
    return {"id": fila["id"], "createdAt": fila["creado"], "status": fila["estado"],
            "paymentStatus": fila["estado_pago"], "paymentMethod": fila["metodo"], "total": fila["total"],
            "shippingAddress": json.loads(fila["direccion"]), "items": json.loads(fila["articulos"])}


@panel.get("/orders")
def pedidos():
    with closing(get_db_connection()) as conexion:
        if g.usuario["rol"] == "administrador":
            filas = conexion.execute("SELECT * FROM pedidos ORDER BY creado DESC")
        else:
            filas = conexion.execute("SELECT * FROM pedidos WHERE cliente=? ORDER BY creado DESC", (g.usuario["id_persona"],))
        return jsonify(data=[pedido_publico(fila) for fila in filas])


@panel.post("/orders")
def crear_pedido_simulado():
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict) or datos.get("paymentMethod") not in ("Tarjeta", "Transferencia", "Efectivo"):
        return jsonify(error="Elegí un medio de pago para la simulación."), 400
    direccion = datos.get("shippingAddress")
    campos = ("firstName", "lastName", "email", "phone", "street", "city", "country", "zip")
    if not isinstance(direccion, dict) or not all(
        isinstance(direccion.get(c), str) and 0 < len(direccion[c].strip()) <= 254 for c in campos
    ):
        return jsonify(error="Completá los datos personales y de envío."), 400
    direccion = {c: direccion[c].strip() for c in campos}
    intento = request.headers.get("Idempotency-Key", "")
    if not 1 <= len(intento) <= 128:
        return jsonify(error="Falta una referencia válida para el pedido."), 400

    cliente = g.usuario["id_persona"]
    clave = str(uuid5(NAMESPACE_URL, f"mercadito/pedidos/{cliente}/{intento}"))
    with closing(get_db_connection()) as conexion, conexion:
        conexion.execute("BEGIN IMMEDIATE")
        anterior = conexion.execute("SELECT * FROM pedidos WHERE id=?", (clave,)).fetchone()
        if anterior:
            return jsonify(data=pedido_publico(anterior))
        carrito = resumen_carrito(conexion, cliente)
        if not carrito["items"]:
            return jsonify(error="Agregá un producto al carrito antes de pagar."), 409
        articulos = [
            {"productId": item["product"]["id"], "title": item["product"]["title"],
             "quantity": item["quantity"], "unitPrice": item["unitPrice"]}
            for item in carrito["items"]
        ]
        conexion.execute(
            """INSERT INTO pedidos (id, cliente, estado_pago, metodo, total, direccion, articulos)
               VALUES (?, ?, 'Simulated', ?, ?, ?, ?)""",
            (clave, cliente, datos["paymentMethod"], carrito["total"], json.dumps(direccion), json.dumps(articulos)),
        )
        fila = conexion.execute("SELECT * FROM pedidos WHERE id=?", (clave,)).fetchone()
        return jsonify(data=pedido_publico(fila)), 201


@panel.route("/admin/orders/<clave>", methods=["PUT", "DELETE"])
def modificar_pedido(clave):
    with closing(get_db_connection()) as conexion, conexion:
        conexion.execute("BEGIN IMMEDIATE")
        fila = conexion.execute("SELECT * FROM pedidos WHERE id=?", (clave,)).fetchone()
        if fila is None:
            return jsonify(error="No se encontró el pedido."), 404
        if request.method == "DELETE":
            conexion.execute("DELETE FROM pedidos WHERE id=?", (clave,))
            return "", 204
        datos = request.get_json(silent=True)
        if (not isinstance(datos, dict) or datos.get("status") not in ("Pending", "Processing", "Shipped", "Complete", "Canceled")
                or datos.get("paymentStatus") not in ("Pending", "Authorized", "Paid", "Failed", fila["estado_pago"])):
            return jsonify(error="Revisá el estado del pedido y del pago."), 400
        if fila["metodo"] != "Cash" and datos["paymentStatus"] != fila["estado_pago"]:
            return jsonify(error="El proveedor de pago gestiona este cobro."), 400
        conexion.execute("UPDATE pedidos SET estado=?, estado_pago=? WHERE id=?", (datos["status"], datos["paymentStatus"], clave))
        return jsonify(data=pedido_publico(conexion.execute("SELECT * FROM pedidos WHERE id=?", (clave,)).fetchone()))


@panel.get("/admin/customers")
def clientes():
    with closing(get_db_connection()) as conexion:
        por_cliente = defaultdict(list)
        for fila in conexion.execute("SELECT * FROM pedidos WHERE cliente IS NOT NULL ORDER BY creado DESC"):
            por_cliente[fila["cliente"]].append(pedido_publico(fila))
        resultado = []
        for persona in conexion.execute("SELECT * FROM personas WHERE rol='cliente' ORDER BY nombre, apellido"):
            compras = por_cliente[persona["id_persona"]]
            resultado.append({"id": str(persona["id_persona"]), "name": f'{persona["nombre"]} {persona["apellido"]}'.strip(),
                              "email": persona["email"], "phone": persona["telefono"], "role": "customer",
                              "orders": compras, "ordersCount": len(compras), "lastOrderAt": compras[0]["createdAt"] if compras else None,
                              "totalSpent": sum(p["total"] for p in compras if p["paymentStatus"] == "Paid" and p["status"] != "Canceled")})
        return jsonify(data=resultado)


@panel.delete("/admin/customers/<int:clave>")
def eliminar_cliente(clave):
    with closing(get_db_connection()) as conexion, conexion:
        conexion.execute("DELETE FROM sesiones_panel WHERE id_persona IN (SELECT id_persona FROM personas WHERE id_persona=? AND rol='cliente')", (clave,))
        if not conexion.execute("DELETE FROM personas WHERE rol='cliente' AND id_persona=?", (clave,)).rowcount:
            return jsonify(error="No se encontró el cliente."), 404
    return "", 204


@panel.get("/admin/stats")
def estadisticas():
    with closing(get_db_connection()) as conexion:
        fila = conexion.execute("""
            SELECT COUNT(*) totalOrders, COUNT(CASE WHEN estado='Pending' THEN 1 END) pendingOrders,
                COUNT(CASE WHEN estado='Complete' THEN 1 END) completeOrders,
                COUNT(CASE WHEN estado='Canceled' THEN 1 END) canceledOrders,
                COALESCE(SUM(CASE WHEN estado_pago='Paid' AND estado!='Canceled' THEN total END),0) revenue,
                (SELECT COUNT(*) FROM personas WHERE rol='cliente') totalCustomers,
                (SELECT COUNT(*) FROM productos) totalProducts FROM pedidos
        """).fetchone()
        return jsonify(data=dict(fila))


@panel.get("/admin/eventos")
def eventos():
    with closing(get_db_connection()) as conexion:
        return jsonify(data=[json.loads(fila["datos"]) for fila in conexion.execute("SELECT datos FROM eventos_calendario")])


@panel.route("/admin/eventos/<clave>", methods=["POST", "PUT", "DELETE"])
def modificar_evento(clave):
    if len(clave) > 128:
        return jsonify(error="Identificador de evento inválido."), 400
    with closing(get_db_connection()) as conexion, conexion:
        if request.method == "DELETE":
            conexion.execute("DELETE FROM eventos_calendario WHERE id=?", (clave,))
            return "", 204
        datos = request.get_json(silent=True)
        if (not isinstance(datos, dict) or not all(isinstance(datos.get(k), str) for k in ("dateTime", "title", "color", "type"))
                or not datos["title"].strip() or not re.fullmatch(r"#[0-9a-fA-F]{6}", datos["color"])):
            return jsonify(error="Revisá el título, el color y la fecha."), 400
        try:
            datetime.fromisoformat(datos["dateTime"])
        except ValueError:
            return jsonify(error="La fecha del evento es inválida."), 400
        datos["id"] = clave
        contenido = json.dumps(datos)
        if request.method == "POST":
            conexion.execute("INSERT OR IGNORE INTO eventos_calendario VALUES (?, ?)", (clave, contenido))
        elif not conexion.execute("UPDATE eventos_calendario SET datos=? WHERE id=?", (contenido, clave)).rowcount:
            return jsonify(error="El evento ya no existe."), 404
        fila = conexion.execute("SELECT datos FROM eventos_calendario WHERE id=?", (clave,)).fetchone()
        return jsonify(data=json.loads(fila["datos"]))
