const express = require('express');
const router = express.Router();
var registrations = require('./fabric-registrations');
var home_textile_invoke = require('./home-textile-business-invokes');
var home_textile_query = require('./home-textile-business-queries');

var library = {"start":0,"step-size":5,"product-stage":3,"supply-chain-stages":5,"key-history-query":1};


const logindetails = require('./credentials.json');




/* 
    Purpose  : To register user in the network
    Type     : POST
    Inputs   : None
    Response : standard
    DB Call  : NONE

*/
router.post('/login',(req,res)=>{
    // User credentials to check if the user is authenticated or not.
 
    const email = req.body.email;
    const password = req.body.password;
    // If the user is authenticated. The user must share the unique ID with other routers in this format 
    //const user  = { name : role }
    console.log(email,password)
    const userId = logindetails.filter(f=>f.email === email && f.password === password);
    if(userId.length>0) {
        res.json({code:1,vendor_id:userId[0].vendor_id,email:userId[0].email,username:userId[0].username,allow:userId[0].allows}); 
        // })
    } else {
        res.json({code:0,response: "invalid crendentials"});
    }
})










/* 
    Purpose  : To register admin in the network
    Type     : POST
    Inputs   : None
    Response : standard
    DB Call  : INSERT 

*/
router.post('/register-admin/', (req, res, next) => {
    console.log(req.body)
    console.log(
        {
            "body":req.body,    
            "call":"register_admin"
        }
    );

    registrations.registerAdmin(req.body.admin_name,req.body.org_name).then(data=>{
        
        console.log("data=====>",data);
        
        res.status(200).json(
            {
                "doc":data.toString(),
                "msg": "Admin registered"
            }
        );

    
        
        })

    
});

/* 
    Purpose  : To Register User in the network
    Type     : POST
    Inputs   : None
    Response : standard
    DB Call  : INSERT 

*/
router.post('/register-user/', (req, res, next) => {
    console.log(
        {
            "body":req.body,
            "call":"register-user"
        }
    );

    registrations.registerUser(req.body.admin_name,req.body.user_name,req.body.user_role,req.body.org_name).then(data=>{
            
        console.log("data=====>",data);
        
        res.status(200).json(
            {
                "doc":data,
                "msg": "User Registration Succesful"
            }
        );

  
    })

});

/* 
    Purpose  : To invoke the chaincode
    Type     : POST
    Inputs   : None
    Response : standard
    DB Call  : INSERT 

*/
router.post('/invoke/', (req, res, next) => {
    console.log(
        {
            "body":req.body,
            "call":"invoke"
        }
    );
    
    var invoke;
    if (req.body.business_type == "home-textile"){
        invoke = home_textile_invoke;
    }
    else{
        res.status(200).json(
            {
                "doc":"",
                "msg": "business doesnt exist"
            }
        );

    }

    invoke.common_invoke(req.body.chain_code_name,req.body.user_name,req.body.func_name,req.body.args).then(data=>{
        console.log("data=====>",data);       
        res.status(200).json(
                {
                    "doc":data,
                    "msg": "invoke successful"
                }
            );
    
    
    })

    


});

/* 
    Purpose  : To Query the Assets history information.
    Type     : POST
    Inputs   : None
    Response : JSON 

*/
router.post('/queryassetid/', (req, res, next) => {
    console.log(
        {
            "body":req.body,
            "call":"query"
        }
    );

    var query;
    if (req.body.business_type == "home-textile"){
    
        query = home_textile_query;
    }else{
        res.status(200).json(
            {
                "doc":"",
                "msg": "business doesnt exist"
            }
        );
    }

    query.common_query(req.body.chain_code_name,req.body.user_name,"queryAssetID",req.body.args).then(data=>{
        
        console.log("data=====>",data);
    
        if(data != null)
        {
            res.status(200).json(
                {
                    "doc":data,
                    "msg": "Query success"
                }
            );
        } else {
            res.status(200).json(
                {
                    "doc":{'response':'Asset Not Found'},
                    "msg": "Query success"
                }
            );
        }
        

    })

    

});


/* 
    Purpose  : To Query the Assets latest information.
    Type     : POST
    Inputs   : None
    Response : JSON 

*/
router.post('/querytransaction/', (req, res, next) => {
    console.log(
        {
            "body":req.body,
            "call":"query"
        }
    );
    var query;
    if (req.body.business_type == "home-textile"){
    
        query = home_textile_query;
    }else{
        res.status(200).json(
            {
                "doc":"",
                "msg": "business doesnt exist"
            }
        );
    }

    query.common_query(req.body.chain_code_name,req.body.user_name,"queryTransaction",req.body.args).then(data=>{
        
        console.log("data=====>",data);
    
        if(data != null)
        {
            res.status(200).json(
                {
                    "doc":data,
                    "msg": "Query success"
                }
            );
        } else {
            res.status(200).json(
                {
                    "doc":{'response':'Asset Not Found'},
                    "msg": "Query success"
                }
            );
        }
        

    })

    

});


/* 
    Purpose  : To Query the Assets history information.
    Type     : POST
    Inputs   : None
    Response : JSON 

*/
router.post('/querytransactionhistory/', (req, res, next) => {
    console.log(
        {
            "body":req.body,
            "call":"query"
        }
    );
    var query;
    if (req.body.business_type == "home-textile"){
    
        query = home_textile_query;
    }else{
        res.status(200).json(
            {
                "doc":"",
                "msg": "business doesnt exist"
            }
        );
    }

    query.common_query(req.body.chain_code_name,req.body.user_name,"queryTransactionHistory",req.body.args).then(data=>{
        
        console.log("data=====>",data);
    
        if(data != null)
        {
            res.status(200).json(
                {
                    "doc":data,
                    "msg": "Query success"
                }
            );
        } else {
            res.status(200).json(
                {
                    "doc":{'response':'Asset Not Found'},
                    "msg": "Query success"
                }
            );
        }
        

    })

    

});




router.post('/queryalltransactions/', (req, res, next) => {
    console.log(
        {
            "body":req.body,
            "call":"query"
        }
    );
    
    var query;
    if (req.body.business_type == "home-textile"){
    
        query = home_textile_query;
    }else{
        res.status(200).json(
            {
                "doc":"",
                "msg": "business doesnt exist"
            }
        );
    }

    query.common_query(req.body.chain_code_name,req.body.user_name,"queryAllTransactions",req.body.args).then(data=>{
        // let d = JSON.parse(data)
        console.log("data=====>",data);
        res.status(200).json(
            {
                "doc":data,
                "msg": "verify success"
            }
        );
    })
});


function getStageID(data,field1,field2) {
    var element = [];
    console.log("STATGE ID ----> ",data[0][field1][field2]);
    for (var i in data) {
        if (element.indexOf(data[i][field1][field2]) == -1) {
            element.push(data[i][field1][field2]);
        }
    }
    return element.sort();
}


router.post('/querytransstagewise/', (req, res, next) => {
    console.log(
        {
            "body":req.body,
            "call":"query"
        }
    );
    var c = [];
    var producer_txid = [req.body.args[0].split('_').slice(0,3).join('_')];
    console.log(producer_txid);


    var query;
    if (req.body.business_type == "home-textile"){
    
        query = home_textile_query;
    }else{
        res.status(200).json(
            {
                "doc":"",
                "msg": "business doesnt exist"
            }
        );
    }


    query.common_query(req.body.chain_code_name,req.body.user_name,"queryTransactionHistory",producer_txid).then(data=>{
        c.push(data.response);
    
        query.common_query(req.body.chain_code_name,req.body.user_name,"queryTransactionHistory",req.body.args).then(data=>{
            console.log("data=====>",data);
            var a = getStageID(data.response, 'Value','stage_id');
                for(var i=0;i<a.length;i++) {
                    var b =[];
                    
                    for (var j = 0; j < data.response.length; j++) {
                        if (data.response[j].Value.stage_id === a[i]) {
                            b.push(data.response[j]);
                        }
                    }
                    console.log(b); 
                    c.push(b);
                }
            data = c;
            console.log(data);
            res.status(200).json(
                {
                    "doc":data,
                    "msg": "verify success"
                }
            );
        })
    
    
    })

    
});



module.exports = router;

