"""Pruebas de integración con SQLite temporal; no modifica los datos locales."""
import os
import tempfile as temporales
import unittest as pruebas
from pathlib import Path as Ruta
from unittest.mock import patch as reemplazar

from flask import Flask as Aplicacion
from api_local import registrar_api


class PruebasApiLocal(pruebas.TestCase):
    def setUp(self):
        self.carpeta = temporales.TemporaryDirectory()
        self.addCleanup(self.carpeta.cleanup)
        self.ruta_base = str(Ruta(self.carpeta.name) / 'prueba.db')
        self.entorno = reemplazar.dict(os.environ, {
            'CORREO_ADMINISTRADOR_LOCAL': 'admin@local.test',
            'CLAVE_ADMINISTRADOR_LOCAL': 'Admin12345'
        })
        self.entorno.start()
        self.addCleanup(self.entorno.stop)
        self.cliente = self.crear_cliente()
        self.producto = {'titulo': 'Yerba de prueba', 'precio': 2500,
                         'precioOferta': 2200, 'cantidad': 12, 'etiquetas': ['Almacén']}

    def crear_cliente(self):
        aplicacion = Aplicacion(__name__)
        aplicacion.config['TESTING'] = True
        registrar_api(aplicacion, self.ruta_base)
        return aplicacion.test_client()

    def ingresar(self, cliente=None):
        respuesta = (cliente or self.cliente).post('/api/autenticacion/ingresar', json={
            'correo': 'admin@local.test', 'contrasena': 'Admin12345'
        })
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.json['datos']['usuario']['rol'], 'administrador')
        return {'Authorization': 'Bearer ' + respuesta.json['datos']['credencial']}

    def test_acceso_y_cierre_de_sesion(self):
        self.assertEqual(self.cliente.post('/api/administracion/productos', json=self.producto).status_code, 401)
        self.assertEqual(self.cliente.post('/api/autenticacion/ingresar', json={
            'correo': 'admin@local.test', 'contrasena': 'incorrecta'
        }).status_code, 401)
        cabeceras = self.ingresar()
        self.assertEqual(self.cliente.get('/api/autenticacion/perfil', headers=cabeceras).status_code, 200)
        self.assertEqual(self.cliente.post('/api/autenticacion/salir', headers=cabeceras).status_code, 204)
        self.assertEqual(self.cliente.get('/api/autenticacion/perfil', headers=cabeceras).status_code, 401)

    def test_productos_persistentes_y_estadisticas(self):
        cabeceras = self.ingresar()
        self.assertEqual(self.cliente.get('/api/productos').json['datos'], [])
        respuesta = self.cliente.post('/api/administracion/productos', headers=cabeceras, json=self.producto)
        self.assertEqual(respuesta.status_code, 201)
        identificador = respuesta.json['datos']['id']
        direccion = '/api/administracion/productos/' + identificador
        otro_cliente = self.crear_cliente()  # Simula reiniciar el servidor.
        self.assertEqual(otro_cliente.get('/api/productos').json['datos'][0]['titulo'], 'Yerba de prueba')
        self.assertEqual(otro_cliente.get('/api/autenticacion/perfil', headers=cabeceras).status_code, 401)
        cabeceras = self.ingresar(otro_cliente)
        editado = {**self.producto, 'cantidad': 8, 'titulo': 'Yerba editada'}
        respuesta = otro_cliente.put(direccion, headers=cabeceras, json=editado)
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.json['datos']['cantidad'], 8)
        self.assertEqual(otro_cliente.get('/api/administracion/estadisticas', headers=cabeceras).json['datos']['totalProductos'], 1)
        self.assertEqual(otro_cliente.delete(direccion, headers=cabeceras).status_code, 204)
        self.assertEqual(otro_cliente.get('/api/productos').json['datos'], [])
        self.assertEqual(otro_cliente.get('/api/administracion/estadisticas', headers=cabeceras).json['datos']['totalProductos'], 0)
        self.assertEqual(otro_cliente.delete(direccion, headers=cabeceras).status_code, 404)

    def test_validaciones_y_cors(self):
        cabeceras = self.ingresar()
        for campos in ({'precio': -1}, {'cantidad': -3}, {'cantidad': 1.5},
                       {'precioOferta': 3000}, {'descuento': 101}, {'titulo': ''}):
            with self.subTest(campos=campos):
                respuesta = self.cliente.post('/api/administracion/productos', headers=cabeceras,
                                              json={**self.producto, **campos})
                self.assertEqual(respuesta.status_code, 400)
        respuesta = self.cliente.options('/api/administracion/productos', headers={'Origin': 'http://localhost:3000'})
        self.assertEqual(respuesta.status_code, 204)
        self.assertEqual(respuesta.headers['Access-Control-Allow-Origin'], 'http://localhost:3000')
        respuesta = self.cliente.get('/api/productos', headers={'Origin': 'https://otro.test'})
        self.assertNotIn('Access-Control-Allow-Origin', respuesta.headers)
        self.assertEqual(self.cliente.post('/api/administracion/imagenes/productos', headers=cabeceras,
                                          json={'imagenCodificada': 'invalida'}).status_code, 400)
        self.assertEqual(self.cliente.get('/api/chat/status', headers=cabeceras).status_code, 501)


if __name__ == '__main__':
    pruebas.main(verbosity=2)
