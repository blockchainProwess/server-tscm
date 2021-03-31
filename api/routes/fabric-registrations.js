var Fabric_Client = require("fabric-client");
var Fabric_CA_Client = require("fabric-ca-client");

var fs = require("fs");
var path = require("path");

var network_folder_name = "test-network";

var demo_fabric_network_path = path.resolve("../test-network");

console.log("path",demo_fabric_network_name);

var org_name = "org1";
var demo_fabric_network_name = "example";
var ca_host = "localhost";
var ca_port = "7054";


var ca_url = `https://${ca_host}:${ca_port}`;
var org_domain_name = `${org_name}.${demo_fabric_network_name}.com`;
var ca_domain_name = 'ca-org1';

var org_tlsca_cert_path = path.resolve(
  demo_fabric_network_path,
  "organizations",
  "peerOrganizations",
  org_domain_name,
  "tlsca",
  `tlsca.${org_domain_name}-cert.pem`
);
var org_tlsca_cert = fs.readFileSync(org_tlsca_cert_path, "utf8");

var fabric_client = new Fabric_Client();
var fabric_ca_client = null;
var admin_user = null;
var user_secret = null;
  
var store_path = path.join(__dirname, `../hfc-key-store/${org_name}`);
console.log(" Store path:" + store_path);



module.exports = {
  
  // check:function(){

  //   return new Promise(resolve => {
  //     resolve("bye");
  //   });
  //   // return ;
  // },

registerUser: function(admin_name,user_name,user_role) {
  
  return new Promise(resolve => {
    
    Fabric_Client.newDefaultKeyValueStore({ path: store_path })
    .then(state_store => {
      fabric_client.setStateStore(state_store);
      var crypto_suite = Fabric_Client.newCryptoSuite();
      var crypto_store = Fabric_Client.newCryptoKeyStore({
        path: store_path
      });
      crypto_suite.setCryptoKeyStore(crypto_store);
      fabric_client.setCryptoSuite(crypto_suite);
      var tlsOptions = {
        trustedRoots: [org_tlsca_cert],
        verify: false
      };
      fabric_ca_client = new Fabric_CA_Client(
        ca_url,
        tlsOptions,
        ca_domain_name,
        crypto_suite
      );

      // first check to see if the admin is already enrolled
      return fabric_client.getUserContext(admin_name, true);
    })
    .then(user_from_store => {
      if (user_from_store && user_from_store.isEnrolled()) {
        console.log("Successfully loaded admin from persistence");
        admin_user = user_from_store;
      } else {
        throw new Error("Failed to get admin.... run enrollAdmin.js");
      }

      // at this point we should have the admin user
      // first need to register the user with the CA server
      return fabric_ca_client.register(
        {
          enrollmentID: user_name,
          affiliation: "org1.department1",
          role: user_role
        },
        admin_user
      );
    })
    .then(secret => {
      // next we need to enroll the user with CA server
      console.log("Successfully registered User - secret:" + secret);
      user_secret = secret;
      return fabric_ca_client.enroll({
        enrollmentID: user_name,
        enrollmentSecret: secret
      });
    })
    .then(enrollment => {
      console.log('Successfully enrolled member user "User" ');
      return fabric_client.createUser({
        username: user_name,
        mspid: `${org_name}MSP`,
        cryptoContent: {
          privateKeyPEM: enrollment.key.toBytes(),
          signedCertPEM: enrollment.certificate
        }
      });
      
    })
    .then(user => {
      member_user = user;
      return fabric_client.setUserContext(member_user);
    })
    .then(() => {
      console.log("User was successfully registered and enrolled and is ready to interact with the fabric network");
      resolve ({"code":1,"data":{"name":user_name,"secret":user_secret}})
    })
    .catch(err => {
      console.error("Failed to register: " + err);
      if (err.toString().indexOf("Authorization") > -1) {
        console.error("Authorization failures may be caused by having admin credentials from a previous CA instance.\n" +
        "Try again after deleting the contents of the store directory " +store_path);
      }
      resolve ({"code":-1,"err":err})
    });
  
  });
  
},

registerAdmin: function(admin_name) {

  


  return new Promise(resolve => {
    Fabric_Client.newDefaultKeyValueStore({ path: store_path })
    .then(state_store => {
      fabric_client.setStateStore(state_store);
      var crypto_suite = Fabric_Client.newCryptoSuite();
      var crypto_store = Fabric_Client.newCryptoKeyStore({ path: store_path });
      crypto_suite.setCryptoKeyStore(crypto_store);
      fabric_client.setCryptoSuite(crypto_suite);
      var tlsOptions = {
        trustedRoots: [org_tlsca_cert],
        verify: false
      };
      fabric_ca_client = new Fabric_CA_Client(
        ca_url,
        tlsOptions,
        ca_domain_name,
        crypto_suite
      );

      return fabric_client.getUserContext(admin_name, true);
    })
    .then(user_from_store => {
      if (user_from_store && user_from_store.isEnrolled()) {
        console.log("Successfully loaded admin from persistence");
        admin_user = user_from_store;
        resolve ({"code":2,"data":admin_user});
      } else {
        return fabric_ca_client
          .enroll({
            enrollmentID: 'admin',
            enrollmentSecret: "adminpw"
          })
          .then(enrollment => {
            console.log('Successfully enrolled admin user "admin"');
            return fabric_client.createUser({
              username: admin_name,
              mspid: `${org_name}MSP`,
              cryptoContent: {
                privateKeyPEM: enrollment.key.toBytes(),
                signedCertPEM: enrollment.certificate
              }
            });
          })
          .then(user => {
            admin_user = user;
            return fabric_client.setUserContext(admin_user);
          })
          .catch(err => {
            console.error(
              "Failed to enroll and persist admin. Error: " + err.stack
                ? err.stack
                : err
            );

            throw new Error("Failed to enroll admin");
          });
      }
    })
    .then(() => {
      console.log(
        "Assigned the admin user to the fabric client ::" +
          admin_user.toString()
      );
      resolve ({"code":1,"data":admin_user.toString()})
    })
    .catch(err => {
      console.error("Failed to enroll admin: " + err);
      resolve ({"code":-1,"err":err})
    });

  
  
  });

  

  
  } 

}


