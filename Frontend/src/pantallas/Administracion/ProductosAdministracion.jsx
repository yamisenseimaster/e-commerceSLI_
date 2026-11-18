import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiGrid,
  FiImage,
  FiList,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { MdDelete, MdEdit, MdSave } from 'react-icons/md';
import BarraLateral from './BarraLateral';
import { apiAdministracion } from '../../servicios/api';
import { usarProductos } from '../../Contextos/ContextoProductos';
import { traducirCategoria } from '../../utilidades/localizacion';

const emptyProduct = {
  title: '',
  slug: '',
  description: '',
  image: '/products/11.png',
  type: 'Lunch',
  tagsText: '',
  price: 0,
  salePrice: 0,
  discount: 0,
  quantity: 0,
  flashSale: false,
};

const ORIGEN_API = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
).replace(/\/api\/?$/, '');

const inputClass =
  'w-full rounded-[5px] border border-[#d9e0ea] bg-white px-3 py-2.5 text-sm font-medium text-[#26344a] outline-none transition focus:border-main dark:border-[#303030] dark:bg-[#111111] dark:text-white';

const categoryColors = {
  Lunch: 'border-blue-200 bg-blue-50 text-blue-600',
  Salad: 'border-green-200 bg-green-50 text-green-600',
  Breakfast: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  Dinner: 'border-purple-200 bg-purple-50 text-purple-600',
  Laptops: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  Headphones: 'border-cyan-200 bg-cyan-50 text-cyan-600',
  Electronics: 'border-cyan-200 bg-cyan-50 text-cyan-600',
  Accessories: 'border-pink-200 bg-pink-50 text-pink-600',
  Storage: 'border-sky-200 bg-sky-50 text-sky-600',
};

function convertirEnCarga(valores) {
  return {
    title: valores.title.trim(),
    slug: (valores.slug || valores.title)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-'),
    description: valores.description,
    image: valores.image,
    type: valores.type,
    tags: valores.tagsText
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    price: Number(valores.price),
    salePrice: Number(valores.salePrice || valores.price),
    discount: Number(valores.discount),
    quantity: Number(valores.quantity),
    flashSale: Boolean(valores.flashSale),
  };
}

function desdeProducto(producto) {
  return {
    title: producto.title || '',
    slug: producto.slug || '',
    description: producto.description || '',
    image: producto.image || '/products/11.png',
    type: producto.type || 'Lunch',
    tagsText: (producto.tags || producto.tag || []).join(', '),
    price: producto.price || 0,
    salePrice: producto.salePrice || producto.price || 0,
    discount: producto.discount || 0,
    quantity: producto.quantity || 0,
    flashSale: Boolean(producto.flashSale),
  };
}

function ProductosAdministracion() {
  const { products: productos, setProducts: establecerProductos } =
    usarProductos();
  const navegar = useNavigate();
  const [valores, establecerValores] = useState(emptyProduct);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [modoModal, establecerModoModal] = useState(null);
  const [enviando, establecerEnviando] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [consulta, establecerConsulta] = useState('');
  const [pagina, establecerPagina] = useState(1);
  const tamanoPagina = viewMode === 'card' ? 16 : 10;

  const categorias = useMemo(() => {
    const actual = productos.map((producto) => producto.type).filter(Boolean);
    return [...new Set([...actual, 'Lunch', 'Salad', 'Breakfast', 'Dinner'])];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    const busqueda = consulta.trim().toLowerCase();
    if (!busqueda) return productos;

    return productos.filter((producto) =>
      [
        producto.title,
        producto.type,
        traducirCategoria(producto.type),
        producto.slug,
      ]
        .filter(Boolean)
        .some((valor) => valor.toLowerCase().includes(busqueda)),
    );
  }, [productos, consulta]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(productosFiltrados.length / tamanoPagina),
  );
  const productosVisibles = productosFiltrados.slice(
    (pagina - 1) * tamanoPagina,
    pagina * tamanoPagina,
  );

  const openCreateModal = () => {
    establecerValores(emptyProduct);
    setEditingProduct(null);
    establecerModoModal('form');
  };

  const openEditModal = (producto) => {
    establecerValores(desdeProducto(producto));
    setEditingProduct(producto);
    establecerModoModal('form');
  };

  const openProductDetails = (producto) => {
    navegar(`/admin/products/${obtenerClaveProducto(producto)}`);
  };

  const cerrarModal = () => {
    if (enviando) return;
    establecerModoModal(null);
    setEditingProduct(null);
    setDeleteProduct(null);
    establecerValores(emptyProduct);
  };

  const manejarCambio = (evento) => {
    const {
      name: nombre,
      value: valor,
      type,
      checked: marcado,
    } = evento.target;
    establecerValores((actual) => ({
      ...actual,
      [nombre]: type === 'checkbox' ? marcado : valor,
    }));
  };

  const manejarSubidaImagen = async (evento) => {
    const archivo = evento.target.files?.[0];
    evento.target.value = '';

    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      toast.error('Selecciona una imagen valida');
      return;
    }

    if (archivo.size > 2 * 1024 * 1024) {
      toast.error('La imagen no puede superar 2MB');
      return;
    }

    setUploadingImage(true);

    try {
      const dataUrl = await leerArchivoComoUrlDatos(archivo);
      const uploaded = await apiAdministracion.subirImagenProducto({
        fileName: archivo.name,
        mimeType: archivo.type,
        dataUrl,
      });

      establecerValores((actual) => ({ ...actual, image: uploaded.url }));
      toast.success('Imagen subida');
    } catch (error) {
      toast.error(error.message || 'No se pudo subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    establecerEnviando(true);

    try {
      const payload = convertirEnCarga(valores);
      const identificador = obtenerClaveProducto(editingProduct);
      const guardado = editingProduct
        ? await apiAdministracion.actualizarProducto(identificador, payload)
        : await apiAdministracion.crearProducto(payload);

      establecerProductos((actual) =>
        editingProduct
          ? actual.map((producto) =>
              obtenerClaveProducto(producto) === identificador
                ? guardado
                : producto,
            )
          : [guardado, ...actual],
      );
      toast.success(
        editingProduct ? 'Producto actualizado' : 'Producto creado',
      );
      cerrarModal();
    } catch (error) {
      toast.error(error.message);
    } finally {
      establecerEnviando(false);
    }
  };

  const manejarEliminacion = async () => {
    if (!deleteProduct) return;
    establecerEnviando(true);

    try {
      const identificador = obtenerClaveProducto(deleteProduct);
      await apiAdministracion.eliminarProducto(identificador);
      establecerProductos((actual) =>
        actual.filter(
          (producto) => obtenerClaveProducto(producto) !== identificador,
        ),
      );
      toast.success('Producto eliminado');
      cerrarModal();
    } catch (error) {
      toast.error(error.message);
    } finally {
      establecerEnviando(false);
    }
  };

  return (
    <BarraLateral title="Productos" eyebrow="Tienda">
      <section className="rounded-[10px] border border-[#d9e0ea] bg-white p-4 shadow-sm shadow-slate-200/80 dark:border-[#2b2b2b] dark:bg-[#191919] dark:shadow-none sm:p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <label className="flex h-11 w-full items-center gap-3 overflow-hidden rounded-[8px] border border-[#d9e0ea] bg-[#fbfcff] px-4 text-[#9aa6b8] dark:border-[#303030] dark:bg-[#111111] dark:text-[#9ca3af] sm:h-10 sm:max-w-[320px]">
            <FiSearch />
            <input
              value={consulta}
              onChange={(evento) => {
                establecerConsulta(evento.target.value);
                establecerPagina(1);
              }}
              className="h-full min-w-0 flex-1 border-0 bg-transparent text-[14px] text-[#26344a] outline-none placeholder:text-[#a9b4c4] dark:text-white dark:placeholder:text-[#6b7280]"
              placeholder="Buscar productos..."
            />
          </label>

          <div className="flex w-full items-center gap-3 sm:w-auto">
            <div className="hidden overflow-hidden rounded-[8px] border border-[#d9e0ea] dark:border-[#303030] sm:flex">
              <button
                className={`flex h-10 w-12 items-center justify-center transition ${
                  viewMode === 'table'
                    ? 'bg-main text-white'
                    : 'bg-[#eef2f7] text-[#162033] hover:bg-[#dfe7f2] dark:bg-[#222222] dark:text-[#cbd5e1] dark:hover:bg-[#2a2a2a]'
                }`}
                type="button"
                title="Vista de tabla"
                onClick={() => {
                  setViewMode('table');
                  establecerPagina(1);
                }}>
                <FiList />
              </button>
              <button
                className={`group relative flex h-10 w-12 items-center justify-center transition ${
                  viewMode === 'card'
                    ? 'bg-main text-white'
                    : 'bg-[#eef2f7] text-[#162033] hover:bg-[#dfe7f2] dark:bg-[#222222] dark:text-[#cbd5e1] dark:hover:bg-[#2a2a2a]'
                }`}
                type="button"
                title="Vista de tarjetas"
                onClick={() => {
                  setViewMode('card');
                  establecerPagina(1);
                }}>
                <FiGrid />
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[#162033] px-2 py-1 text-[12px] font-bold text-white group-hover:block">
                  Vista de tarjetas
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[8px] bg-main px-5 text-[14px] font-bold text-white shadow-sm transition hover:bg-subMain sm:h-10 sm:flex-none">
              <FiPlus /> Agregar nuevo
            </button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="scrollbar-invisible overflow-x-auto rounded-[8px]">
            <table className="min-w-[900px] w-full text-[14px]">
              <thead className="bg-[#eef2f7] text-left text-[12px] font-black uppercase text-[#6b7788] dark:bg-[#222222] dark:text-slate-300">
                <tr>
                  <th className="px-4 py-4">Producto</th>
                  <th className="px-4 py-4">Categoria</th>
                  <th className="px-4 py-4">Precio</th>
                  <th className="px-4 py-4">Stock</th>
                  <th className="px-4 py-4">Fecha</th>
                  <th className="px-4 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e7f0] bg-white dark:divide-[#2b2b2b] dark:bg-[#191919]">
                {productosVisibles.map((producto) => (
                  <tr
                    key={obtenerClaveProducto(producto)}
                    className="transition hover:bg-[#f8fbff] dark:hover:bg-[#222222]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={normalizarImagen(producto.image)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-9 w-9 rounded-[4px] object-cover"
                        />
                        <div className="min-w-0">
                          <p className="max-w-[250px] truncate font-bold text-[#26344a] dark:text-white">
                            {producto.title}
                          </p>
                          <p className="text-[12px] text-[#7b8798]">
                            {traducirCategoria(producto.type)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <InsigniaCategoria category={producto.type} />
                    </td>
                    <td className="px-4 py-3 font-black text-[#162033] dark:text-white">
                      {formatearDinero(producto.salePrice || producto.price)}
                    </td>
                    <td className="px-4 py-3 text-[#26344a] dark:text-slate-200">
                      {Number(producto.quantity || 0)} unidades
                    </td>
                    <td className="px-4 py-3 text-[#6b7788] dark:text-[#9ca3af]">
                      {formatearFecha(producto.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <AccionesProducto
                        compact
                        onDelete={() => {
                          setDeleteProduct(producto);
                          establecerModoModal('delete');
                        }}
                        onEdit={() => openEditModal(producto)}
                        onView={() => openProductDetails(producto)}
                      />
                    </td>
                  </tr>
                ))}
                {productosVisibles.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center font-semibold text-[#7b8798]">
                      No se encontraron productos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {productosVisibles.map((producto) => (
              <TarjetaProducto
                key={obtenerClaveProducto(producto)}
                onDelete={() => {
                  setDeleteProduct(producto);
                  establecerModoModal('delete');
                }}
                onEdit={() => openEditModal(producto)}
                onView={() => openProductDetails(producto)}
                product={producto}
              />
            ))}
            {productosVisibles.length === 0 && (
              <div className="col-span-full rounded-[6px] border border-dashed border-[#d9e0ea] px-4 py-12 text-center font-semibold text-[#7b8798] dark:border-[#303030]">
                No se encontraron productos.
              </div>
            )}
          </div>
        )}

        <div className="mt-5 flex flex-col items-stretch justify-between gap-3 text-[14px] text-[#6b7788] dark:text-[#9ca3af] sm:flex-row sm:items-center">
          <p>
            Mostrando{' '}
            <strong>
              {productosFiltrados.length === 0
                ? 0
                : (pagina - 1) * tamanoPagina + 1}
            </strong>{' '}
            a{' '}
            <strong>
              {Math.min(pagina * tamanoPagina, productosFiltrados.length)}
            </strong>{' '}
            de <strong>{productosFiltrados.length}</strong> productos
          </p>
          <div className="flex items-center justify-center gap-2 sm:justify-end">
            <BotonPaginacion
              disabled={pagina === 1}
              onClick={() => establecerPagina(1)}>
              «
            </BotonPaginacion>
            <BotonPaginacion
              disabled={pagina === 1}
              onClick={() =>
                establecerPagina((actual) => Math.max(1, actual - 1))
              }>
              ‹
            </BotonPaginacion>
            <button
              className="h-9 min-w-9 rounded-[5px] bg-main px-3 text-sm font-bold text-white"
              type="button">
              {pagina}
            </button>
            <BotonPaginacion
              disabled={pagina === totalPaginas}
              onClick={() =>
                establecerPagina((actual) => Math.min(totalPaginas, actual + 1))
              }>
              ›
            </BotonPaginacion>
            <BotonPaginacion
              disabled={pagina === totalPaginas}
              onClick={() => establecerPagina(totalPaginas)}>
              »
            </BotonPaginacion>
          </div>
        </div>
      </section>

      {modoModal === 'form' && (
        <ModalProducto
          categories={categorias}
          editing={Boolean(editingProduct)}
          onChange={manejarCambio}
          onImageUpload={manejarSubidaImagen}
          onClose={cerrarModal}
          onSubmit={manejarEnvio}
          submitting={enviando}
          uploadingImage={uploadingImage}
          values={valores}
        />
      )}

      {modoModal === 'delete' && deleteProduct && (
        <ConfirmarEliminacion
          onClose={cerrarModal}
          onConfirm={manejarEliminacion}
          product={deleteProduct}
          submitting={enviando}
        />
      )}
    </BarraLateral>
  );
}

function ModalProducto({
  categories: categorias,
  editing,
  onChange: alCambiar,
  onClose: alCerrar,
  onImageUpload,
  onSubmit: alEnviar,
  submitting: enviando,
  uploadingImage,
  values: valores,
}) {
  return (
    <EstructuraModal onClose={alCerrar} width={760}>
      <form
        onSubmit={alEnviar}
        className="flex max-h-[86vh] w-full flex-col overflow-hidden rounded-[8px] bg-white shadow-2xl dark:bg-[#191919]">
        <div className="flex shrink-0 items-center justify-between border-b border-[#e1e7f0] px-5 py-4 dark:border-[#2b2b2b]">
          <div>
            <h2 className="text-xl font-black text-[#26344a] dark:text-white">
              {editing ? 'Modificar producto' : 'Agregar producto'}
            </h2>
            <p className="text-sm text-[#7b8798]">
              Completa los datos del inventario.
            </p>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f7ff] text-[#64748b] dark:bg-[#242424] dark:text-[#d1d5db]">
            <FiX />
          </button>
        </div>

        <div className="scrollbar-invisible grid flex-1 gap-4 overflow-y-auto px-5 py-4 sm:grid-cols-2">
          <CampoFormulario label="Titulo">
            <input
              name="title"
              value={valores.title}
              onChange={alCambiar}
              required
              placeholder="Titulo del producto"
              className={inputClass}
            />
          </CampoFormulario>
          <CampoFormulario label="Slug">
            <input
              name="slug"
              value={valores.slug}
              onChange={alCambiar}
              placeholder="slug-del-producto"
              className={inputClass}
            />
          </CampoFormulario>
          <CampoFormulario label="Imagen">
            <div className="rounded-[6px] border border-[#d9e0ea] bg-[#fbfcff] p-3 dark:border-[#303030] dark:bg-[#111111]">
              <div className="mb-3 flex items-center gap-3">
                <img
                  src={normalizarImagen(valores.image)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-14 w-14 rounded-[5px] border border-[#e1e7f0] bg-white object-cover dark:border-[#303030] dark:bg-[#202020]"
                  onError={(evento) => {
                    evento.currentTarget.src = '/images/products/11.png';
                  }}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-[#26344a] dark:text-white">
                    {valores.image || 'Sin imagen seleccionada'}
                  </p>
                  <p className="text-[12px] font-medium text-[#7b8798]">
                    PNG, JPG, WEBP o GIF hasta 2MB
                  </p>
                </div>
              </div>
              <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[5px] bg-main px-4 text-sm font-black text-white transition hover:bg-subMain">
                <FiImage />
                {uploadingImage ? 'Subiendo imagen...' : 'Subir imagen'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  disabled={uploadingImage || enviando}
                  onChange={onImageUpload}
                />
              </label>
              <input
                name="image"
                value={valores.image}
                onChange={alCambiar}
                required
                placeholder="URL de la imagen"
                className={`${inputClass} mt-3`}
              />
            </div>
          </CampoFormulario>
          <CampoFormulario label="Categoria">
            <select
              name="type"
              value={valores.type}
              onChange={alCambiar}
              className={inputClass}>
              {[...categorias, valores.type]
                .filter(Boolean)
                .map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {traducirCategoria(categoria)}
                  </option>
                ))}
            </select>
          </CampoFormulario>
          <CampoFormulario label="Precio">
            <input
              name="price"
              value={valores.price}
              onChange={alCambiar}
              type="number"
              min="0"
              step="0.01"
              required
              className={inputClass}
            />
          </CampoFormulario>
          <CampoFormulario label="Precio oferta">
            <input
              name="salePrice"
              value={valores.salePrice}
              onChange={alCambiar}
              type="number"
              min="0"
              step="0.01"
              required
              className={inputClass}
            />
          </CampoFormulario>
          <CampoFormulario label="Descuento">
            <input
              name="discount"
              value={valores.discount}
              onChange={alCambiar}
              type="number"
              min="0"
              max="100"
              className={inputClass}
            />
          </CampoFormulario>
          <CampoFormulario label="Stock">
            <input
              name="quantity"
              value={valores.quantity}
              onChange={alCambiar}
              type="number"
              min="0"
              required
              className={inputClass}
            />
          </CampoFormulario>
          <CampoFormulario label="Etiquetas" className="md:col-span-2">
            <input
              name="tagsText"
              value={valores.tagsText}
              onChange={alCambiar}
              placeholder="etiquetas, separadas, por coma"
              className={inputClass}
            />
          </CampoFormulario>
          <CampoFormulario label="Descripcion" className="md:col-span-2">
            <textarea
              name="description"
              value={valores.description}
              onChange={alCambiar}
              placeholder="Descripcion"
              className={`${inputClass} min-h-24 resize-none`}
            />
          </CampoFormulario>
          <label className="flex items-center gap-2 text-sm font-bold text-[#26344a] dark:text-white">
            <input
              name="flashSale"
              checked={valores.flashSale}
              onChange={alCambiar}
              type="checkbox"
            />
            Oferta relampago
          </label>
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-[#e1e7f0] px-5 py-4 dark:border-[#2b2b2b]">
          <button
            type="button"
            onClick={alCerrar}
            className="rounded-[5px] bg-[#64748b] px-5 py-2.5 text-sm font-bold text-white">
            Cancelar
          </button>
          <button
            disabled={enviando}
            className="flex items-center gap-2 rounded-[5px] bg-main px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            <MdSave />{' '}
            {enviando
              ? 'Guardando...'
              : editing
                ? 'Guardar cambios'
                : 'Crear producto'}
          </button>
        </div>
      </form>
    </EstructuraModal>
  );
}

function ConfirmarEliminacion({
  onClose: alCerrar,
  onConfirm,
  product: producto,
  submitting: enviando,
}) {
  return (
    <EstructuraModal onClose={alCerrar} width={440}>
      <div className="w-full rounded-[8px] bg-white p-6 shadow-2xl dark:bg-[#191919]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#26344a] dark:text-white">
              Eliminar producto
            </h2>
            <p className="mt-2 text-sm text-[#64748b]">
              Esta accion eliminara <strong>{producto.title}</strong> del
              inventario y del reporte de stock.
            </p>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3f7ff] text-[#64748b]">
            <FiX />
          </button>
        </div>
        <div className="flex items-center gap-3 rounded-[5px] bg-red-50 p-3 dark:bg-[#2a1717]">
          <img
            src={normalizarImagen(producto.image)}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-12 w-12 rounded object-cover"
          />
          <div>
            <p className="font-bold text-[#26344a] dark:text-white">
              {producto.title}
            </p>
            <p className="text-sm text-[#64748b]">
              {Number(producto.quantity || 0)} unidades
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={alCerrar}
            className="rounded-[5px] bg-[#64748b] px-5 py-2.5 text-sm font-bold text-white">
            Cancelar
          </button>
          <button
            type="button"
            disabled={enviando}
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-[5px] bg-flash px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            <FiTrash2 /> {enviando ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </EstructuraModal>
  );
}

function TarjetaProducto({
  onDelete: alEliminar,
  onEdit: alEditar,
  onView,
  product: producto,
}) {
  const stock = Number(producto.quantity || 0);
  const estado =
    stock === 0 ? 'Agotado' : stock <= 10 ? 'Stock bajo' : 'Disponible';
  const statusClass =
    stock === 0
      ? 'border-pink-200 bg-pink-50 text-pink-500'
      : stock <= 10
        ? 'border-yellow-200 bg-yellow-50 text-yellow-600'
        : 'border-cyan-200 bg-cyan-50 text-cyan-600';

  return (
    <article className="overflow-hidden rounded-[6px] border border-[#d9e0ea] bg-white shadow-sm shadow-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-md dark:border-[#2b2b2b] dark:bg-[#191919] dark:shadow-none">
      <div className="relative flex h-52 items-center justify-center bg-[#f7f9fc] p-4 dark:bg-[#111111]">
        <span
          className={`absolute right-3 top-3 rounded-[4px] border px-2 py-1 text-[12px] font-bold ${statusClass}`}>
          {estado}
        </span>
        <img
          src={normalizarImagen(producto.image)}
          alt={producto.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
          onError={(evento) => {
            evento.currentTarget.src = '/images/products/11.png';
          }}
        />
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-[#7b8798]">
            {stock} unidades
          </span>
        </div>
        <h3 className="truncate text-[15px] font-black text-[#26344a] dark:text-white">
          {producto.title}
        </h3>
        <p className="mt-1 truncate text-[13px] font-medium text-[#7b8798]">
          {traducirCategoria(producto.type) || 'General'}{' '}
          {producto.slug ? `• ${producto.slug}` : ''}
        </p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="text-[20px] font-black text-[#162033] dark:text-white">
            {formatearDinero(producto.salePrice || producto.price)}
          </p>
          <span className="text-[13px] font-medium text-[#7b8798]">
            {formatearFecha(producto.createdAt)}
          </span>
        </div>
        <AccionesProducto
          onDelete={alEliminar}
          onEdit={alEditar}
          onView={onView}
        />
      </div>
    </article>
  );
}

function AccionesProducto({
  compact = false,
  onDelete: alEliminar,
  onEdit: alEditar,
  onView,
}) {
  return (
    <div className={`${compact ? '' : 'mt-4'} flex justify-center gap-2`}>
      <button
        className={`${compact ? 'w-11' : 'flex-1'} flex h-9 items-center justify-center rounded-[5px] bg-main text-white transition hover:bg-subMain`}
        type="button"
        title="Editar"
        onClick={alEditar}>
        <MdEdit />
      </button>
      <button
        className={`${compact ? 'w-11' : 'flex-1'} flex h-9 items-center justify-center rounded-[5px] bg-flash text-white transition hover:bg-red-600`}
        type="button"
        title="Eliminar"
        onClick={alEliminar}>
        <MdDelete />
      </button>
      <button
        className={`${compact ? 'w-11' : 'flex-1'} flex h-9 items-center justify-center rounded-[5px] bg-[#64748b] text-white transition hover:bg-[#475569]`}
        type="button"
        title="Ver detalles"
        onClick={onView}>
        <FiMoreVertical />
      </button>
    </div>
  );
}

function EstructuraModal({ children: hijos, onClose: alCerrar, width = 720 }) {
  return (
    <div className="scrollbar-invisible fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-900/55 p-4 backdrop-blur-sm">
      <button
        className="absolute inset-0 cursor-default"
        type="button"
        aria-label="Cerrar modal"
        onClick={alCerrar}
      />
      <div
        className="relative z-[1] my-auto w-full"
        style={{ maxWidth: `${width}px` }}>
        {hijos}
      </div>
    </div>
  );
}

function CampoFormulario({ children: hijos, className = '', label: etiqueta }) {
  return (
    <label
      className={`text-sm font-bold text-[#26344a] dark:text-white ${className}`}>
      {etiqueta}
      <div className="mt-2">{hijos}</div>
    </label>
  );
}

function BotonPaginacion({
  children: hijos,
  disabled: deshabilitado,
  onClick: alHacerClic,
}) {
  return (
    <button
      type="button"
      disabled={deshabilitado}
      onClick={alHacerClic}
      className="h-9 min-w-9 rounded-[5px] bg-[#eef2f7] px-3 text-sm font-bold text-[#64748b] transition hover:bg-[#dfe7f2] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#222222] dark:text-[#cbd5e1] dark:hover:bg-[#2a2a2a]">
      {hijos}
    </button>
  );
}

function InsigniaCategoria({ category: categoria }) {
  const color =
    categoryColors[categoria] || 'border-blue-200 bg-blue-50 text-blue-600';

  return (
    <span
      className={`inline-flex rounded-[3px] border px-2 py-1 text-[12px] font-bold ${color}`}>
      {traducirCategoria(categoria) || 'General'}
    </span>
  );
}

function normalizarImagen(imagen) {
  if (!imagen) return '/images/products/11.png';
  if (imagen.startsWith('http') || imagen.startsWith('data:')) return imagen;
  if (imagen.startsWith('/media/')) return `${ORIGEN_API}${imagen}`;
  if (imagen.startsWith('/products/'))
    return imagen.replace('/products/', '/images/products/');
  return imagen;
}

function leerArchivoComoUrlDatos(archivo) {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(lector.result);
    lector.onerror = () => rechazar(new Error('No se pudo leer la imagen'));
    lector.readAsDataURL(archivo);
  });
}

function obtenerClaveProducto(producto) {
  return producto?.id || producto?._id;
}

function formatearDinero(valor) {
  return `$${Number(valor || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatearFecha(valor) {
  if (!valor) return '14/5/2023';

  return new Date(valor).toLocaleDateString('es-ES');
}

export default ProductosAdministracion;
