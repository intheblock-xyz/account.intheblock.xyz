import Vue from "vue"
import VueRouter from "vue-router"
import Home from "../views/Home.vue"

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
]

const router = new VueRouter({
  // mode: "history",
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve) => {
      if (savedPosition) {
        setTimeout(() => {
          resolve(savedPosition)
        }, 500)
      } else if (to.hash) {
        setTimeout(() => {
          const element = document.getElementById(to.hash.substring("#".length))
          element.scrollIntoView({behavior: "smooth"})
          resolve(true)
        }, 500)
      } else {
        resolve({x: 0, y: 0})
      }
    })
  },
})

export default router
