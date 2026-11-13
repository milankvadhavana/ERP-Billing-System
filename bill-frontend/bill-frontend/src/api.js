import axios from "axios";

const API = axios.create({
<<<<<<< HEAD
  baseURL: "http://localhost:8081/api",
});



// const API = axios.create({
//   baseURL: "https://billing-system-1-paoh.onrender.com/api/auth",
// });


=======
  baseURL: "http://localhost:8081/api/auth",
});

>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d
export default API;