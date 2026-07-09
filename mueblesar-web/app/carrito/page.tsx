"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { Container } from "../components/layout/Container";
import { Button } from "../components/ui/Button";
import { EmptyCart } from "../components/ui/EmptyState";
import { getCartTotal, groupCartByStore, generateWhatsAppMessage } from "../lib/cart";

export default function CartPage() {
  const { items, removeItem, updateItemQuantity, clearItems } = useCart();
  const { success, info } = useToast();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleRemoveItem = (itemId: number, itemName: string) => {
    removeItem(itemId);
    info(`${itemName} eliminado del carrito`);
  };

  const handleClearCart = () => {
    clearItems();
    setShowClearConfirm(false);
    success("Carrito vaciado correctamente");
  };

  if (items.length === 0) {
    return (
      <div className="py-12 md:py-20">
        <Container>
          <EmptyCart />
        </Container>
      </div>
    );
  }

  const total = getCartTotal(items);
  const storeGroups = groupCartByStore(items);

  const handleWhatsAppConsult = () => {
    const message = generateWhatsAppMessage(items);
    // Si hay una sola tienda, usar su whatsapp
    const storeKeys = Object.keys(storeGroups);
    const whatsapp = storeKeys.length === 1 && items[0]?.storeWhatsapp
      ? items[0].storeWhatsapp
      : "5493512345678"; // Número por defecto (ajustar según tu caso)
    
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };



  return (
    <div className="py-10">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Carrito</h1>
          <p className="text-gray-600 mt-2">
            {items.length} {items.length === 1 ? "producto" : "productos"} en tu carrito
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Lista de productos */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                {item.imageUrl && (
                  <Link href={`/productos/${item.slug}`}>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-24 w-24 flex-shrink-0 rounded-lg object-cover hover:opacity-80 transition"
                    />
                  </Link>
                )}
                
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/productos/${item.slug}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-primary">
                        {item.name}
                      </h3>
                    </Link>
                    <Link href={`/catalog/${item.storeSlug}`}>
                      <p className="text-sm text-gray-600 hover:text-primary">
                        {item.storeName}
                      </p>
                    </Link>
                    <p className="mt-2 text-lg font-bold text-primary">
                      ${item.price.toLocaleString("es-AR")}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 hover:bg-gray-100"
                        aria-label="Disminuir cantidad"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 hover:bg-gray-100"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id, item.name)}
                      className="text-sm text-red-600 hover:text-red-800 hover:underline ml-auto"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen y acciones */}
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen</h2>
              
              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${total.toLocaleString("es-AR")}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span>${total.toLocaleString("es-AR")}</span>
              </div>

              <Button
                onClick={handleWhatsAppConsult}
                className="w-full mb-3 flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Consultar por WhatsApp
              </Button>

              <p className="text-xs text-gray-500 text-center mb-4">
                Te redirigiremos a WhatsApp con tu consulta lista
              </p>

              {!showClearConfirm ? (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full text-sm text-gray-600 hover:text-red-600 hover:underline"
                >
                  Vaciar carrito
                </button>
              ) : (
                <div className="space-y-2 text-center">
                  <p className="text-sm text-gray-700 font-medium">¿Estás seguro?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearCart}
                      className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                    >
                      Sí, vaciar
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Info adicional */}
            <div className="rounded-lg border border-gray-200 bg-blue-50 p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
                Importante
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Los precios son informativos</li>
                <li>• Confirmá disponibilidad por WhatsApp</li>
                <li>• Consultá sobre envíos y formas de pago</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
