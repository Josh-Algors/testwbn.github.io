const axios = require('axios');

const validate = async function bvn(bvn)
{
    var data = JSON.stringify({
      "bvn": bvn
    });
    var config = {
      method: 'post',
      url: 'http://35.238.52.213/bvn-service/@@/VerifySingleBVN',
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };

    return axios(config);
}

const whatsapp = async function bvn(phone, message)
{
    var axios = require('axios');
    var data = JSON.stringify({
        "sender_id": "Dojah",
        "destination": phone,
        "channel": "whatsapp",
        "priority": false,
        "message": message
    });

    var config = {
        method: 'post',
        url: 'https://api.dojah.io/api/v1/messaging/sms',
        headers: { 
            'AppId': '6123c4fd23a5a600352e31b5', 
            'Authorization': 'prod_sk_HzcyFBc2ghnUL9SgCGLKZ49uW', 
            'Content-Type': 'application/json'
        },
        data : data
    };

    axios(config)
    .then(function (response) {
        console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
        console.log(error);
    });
}

module.exports = {
    validate,
    whatsapp
}