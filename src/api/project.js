import axios from "axios"

export default {
  project() {
    return axios.get(`${process.env.BASE_URL}/data/project.json`)
  },
}
