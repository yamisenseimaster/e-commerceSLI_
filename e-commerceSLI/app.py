from flask import Flask, jsonify

from database.db import init_db
from routes.autenticacion import autenticacion
from routes.productos import catalogo
from models.DetalleVenta import DetalleVenta
from models.Persona import Persona
from models.Producto import Producto
from models.Sucursal import Sucursal
from models.Venta import Venta

app = Flask(__name__)
app.register_blueprint(autenticacion)
app.register_blueprint(catalogo)


@app.route("/home")
def home():
    cliente = Persona(
        nombre="Samuel",
        apellido="Pérez",
        dni="40123456",
        fecha_nacimiento="2005/09/17",
        email="samuel@email.com",
        genero="Masculino",
        username="samuel123",
        password_hash="mi_password_seguro",
        rol="cliente",
    )
    sucursal = Sucursal(
        nombre="Sucursal Centro", direccion="Belgrano 450", codigo_postal=4600, id=1
    )

    # 2. Crear Productos y asignar Stock
    p1 = Producto(
        id=1,
        nombre="Papas Fritas",
        marca="Lays",
        precio=2000,
        descripcion="Sabor Original 180grs",
        tiene_descuento=False,
    )
    p1.agregar_stock_por_sucursal(id_sucursal=1, cantidad=50)

    p2 = Producto(
        id=2,
        nombre="Gaseosa Cola",
        marca="Coca Cola",
        precio=1500,
        descripcion="1.5 Litros",
        tiene_descuento=True,
    )
    p2.agregar_stock_por_sucursal(id_sucursal=1, cantidad=30)

    # 3Crear DetalleVenta y Venta
    detalle1 = DetalleVenta(producto=p1, cantidad=2, precio_unitario=p1.precio)
    detalle2 = DetalleVenta(producto=p2, cantidad=1, precio_unitario=p2.precio)

    venta = Venta(
        persona_cliente=cliente,
        sucursal=sucursal,
        medio_pago="debito",
        id=100,
    )
    venta.agregar_detalle(detalle1)
    venta.agregar_detalle(detalle2)

    # 4. Devolver la Venta serializada en JSON
    return jsonify(venta.to_dict())


if __name__ == "__main__":
    init_db()
    print("Base de datos inicializada correctamente.")
    app.run(debug=True)
