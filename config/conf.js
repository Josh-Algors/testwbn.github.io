require('dotenv').config();

module.exports = {
    'paystack': {
        'sandbox': {
            'public_key': "",
            'secret_key': ""
        },
        'production': {
            'public_key': "",
            'secret_key': ""
        }        
    },
    'providus': {
        'sandbox': {
            'card': {
                'username': 'test',
                'password': 'test',
                'dollar_user': 'test',
                'dollar_pass': 'test',
                'url': 'http://154.113.16.142:8088/PrepaidCardServiceTest/IswPrepaidCardService.asmx?wsdl',
                'host': '154.113.16.142'
            },
            'payment': {
                'username': 'fundall',
                'password': 'fundall',
                'url': 'http://154.113.16.142:9999/Payments/api?wsdl',
                'host': '154.113.16.142'
            }
        },
        'production': {
            'card': {
                'username': 'fundall',
                'password': 'fuN9@L1@9R04!@v',
                'dollar_user': 'fundall',
                'dollar_pass': 'F()Nd@11!_P&0V2',
                'url': 'http://154.113.16.138:81/PrepaidCardService/IswPrepaidCardService.asmx?wsdl',
                'host': '154.113.16.138'
            },
            'payment': {
                'username': 'fundall',
                'password': 'F0NdA11@9R04!@',
                'url': 'http://192.168.156.27:8080/PaymentsLive/api?wsdl',
                'host': '192.168.156.27'
            }
        }
    }
};