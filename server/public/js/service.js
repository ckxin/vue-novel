const axios = require('axios');

const service = axios.create({
    url: "",
    method: "GET",
    timeout: 1000,
    responseType: 'arraybuffer'
});


service.interceptors.response.use(null, err => {
    const { config, code } = err;
    if(code === 'ECONNABORTED') {
        return new Promise(resolve => {
            setTimeout(async () => {
                resolve(await service(config));
            }, 1000);
        })
    }
});

module.exports = service;