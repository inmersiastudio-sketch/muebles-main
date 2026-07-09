import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";
const EMAIL = __ENV.ADMIN_EMAIL || "admin@example.com";
const PASSWORD = __ENV.ADMIN_PASSWORD || "admin123";

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 50 },
    { duration: "2m", target: 100 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

export default function () {
  // Listado de productos
  const products = http.get(`${BASE_URL}/api/products`);
  check(products, { "products 200": (r) => r.status === 200 });

  // Listado de tiendas
  const stores = http.get(`${BASE_URL}/api/stores`);
  check(stores, { "stores 200": (r) => r.status === 200 });

  // Login + eventos AR (sólo una vez por VU)
  const shouldLogin = (__ITER === 0);
  if (shouldLogin) {
    const login = http.post(`${BASE_URL}/api/auth/login`, { email: EMAIL, password: PASSWORD });
    check(login, { "login ok": (r) => r.status === 200 });
    const token = login.json("token");
    if (token) {
      const arView = http.post(
        `${BASE_URL}/api/events/ar-view`,
        JSON.stringify({ productId: 1, storeId: 1, source: "k6" }),
        {
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      check(arView, { "ar-view ok": (r) => r.status === 200 });
    }
  }

  sleep(1);
}
