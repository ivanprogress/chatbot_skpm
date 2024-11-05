var express = require('express');
var app = express();
app.use(express.json());
var body_parser = require("body-parser");
var axios = require("axios").default;
const port = 3000;

require('dotenv').config(); // Load environment variables from .env
const verify_token = process.env.VERIFY_TOKEN;
const token = process.env.WHATSAPP_TOKEN;
const host= process.env.HOST      // Your database host
const user= process.env.USER  // Your database username
const password= process.env.PASSWORD // Your database password
const database= process.env.DATABASE // Your database name

const mysql = require('mysql2');
// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: host,       // Your database host
  user: user,   // Your database username
  password: password, // Your database password
  database: database // Your database name
});

// Connect to the database
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});

// Handle process termination
process.on('exit', () => {
  // Close the database connection before exiting
  connection.end();
});

// Handle SIGINT (Ctrl+C) and SIGTERM (termination signals)
process.on('SIGINT', () => {
  console.log('Received SIGINT signal. Closing database connection...');
  connection.end(() => {
    process.exit(0); // Terminate the process after closing the connection
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  connection.end(() => {
    process.exit(1); // Terminate the process after closing the connection
  });
});

//TEST
const query_awal = "SELECT * FROM `data` WHERE `parent` IS NULL";
const query_login = "SELECT * FROM `data` WHERE `parent` = 5";
const query_SKPM = "SELECT * FROM `data` WHERE `parent` = 19";
// Execute the query
let queryResult; // Define a variable to hold the results
let bodyResult;
let typeResult;




// Accepts POST requests at /webhook endpoint
app.post('/*', (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the Incoming webhook message
  console.log(JSON.stringify(req.body, null, 2));

  // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from;

      if(typeof req.body.entry[0].changes[0].value.messages[0].interactive != 'undefined') {
        let id_title = req.body.entry[0].changes[0].value.messages[0].interactive.list_reply.id;
        console.log("This title "+id_title);

        //Login Menu
        const default_isi = () => {
          return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM data WHERE parent = ?`,[id_title], (err, results) => {
              if (err) {
                console.error('Error executing the query: ' + err);
                reject(err);
              } else {
                queryResult = results;
                // console.log('Query results:', queryResult);
                // for (const result of queryResult) {
                //   console.log('Query body result:', result);
                //   if (result && result.body) {
                //     const body = result.body;
                //     console.log('Query body result:', result.id);
                //     console.log('Query body result:', result.parent);
                //     console.log('Query body result:', result.type);
                //     console.log('Query body result:', result.header);
                //     console.log('Query body result:', result.body);
                //   } else {
                //     console.log('Invalid query result format:', result);
                //   }
                // }
                resolve(results);
              }
            });
          });
        };

        default_isi()
            .then(() => {
              // 'queryResult' is now defined with the query results
              console.log('Query results:', queryResult);

              // Ensure queryResult is an array and has data
              if (Array.isArray(queryResult) && queryResult.length > 0) {
                for (const result of queryResult) {
                  if (result && result.body) {
                    const body = result.body;
                    // console.log('Query body result:', body);
                  } else {
                    console.log('Invalid query result format:', result);
                  }
                }

                async function sendMessages() {
                  for (const messageObj of queryResult) {
                    const id = messageObj.id;
                    const parent = messageObj.parent;
                    const type = messageObj.type;
                    const header = messageObj.header;
                    const message = messageObj.body;

                    if (type == 'text'){
                      try {
                        await axios({
                          method: "POST",
                          url:
                            "https://graph.facebook.com/v12.0/" +
                            phone_number_id +
                            "/messages?access_token=" +
                            token,
                            data: {
                              messaging_product: "whatsapp",
                              to: from,
                              text: {
                                body: message
                              },
                            },
                          headers: { "Content-Type": "application/json" },
                        });
                        console.log(`Message sent: ${message}`);
                      } catch (error) {
                        console.error('Error sending message:', error);
                      }
                    }
                    else if (type == 'interactive') {
                      async function sendFacebookMessage() {
                        try {
                          const formattedData = []; // Definisikan formattedData

                          // Ambil data
                          const row_results = await new Promise((resolve, reject) => {
                            connection.query('SELECT id, parent, body FROM data WHERE type = "row" AND parent = ?', [id_title], (error, result) => {
                              if (error) {
                                console.error('Error executing the query:', error);
                                reject(error);
                              } else {
                                resolve(result);
                              }
                            });
                          });

                          // Dimasukkan ke array
                          let formattedRows = row_results.map(row => ({
                            id: row.id,
                            title: row.body
                          }));

                          // Cek and prosess tambahaan data jika dibutuhkan
                          if (row_results.length > 0 && row_results[0].parent !== 1) {
                            const additionalResult = await new Promise((resolve, reject) => {
                              connection.query('SELECT parent FROM data WHERE id = ?', [id_title], (err, results) => {
                                if (err) {
                                  console.error('Error executing the query:', err);
                                  reject(err);
                                } else {
                                  resolve(results[0].parent);
                                }
                              });
                            });

                            if (additionalResult === 5 || additionalResult === 1) {
                              // formattedRows.push({ id: additionalResult, title: 'Menu Sebelumnya' });
                            } else {
                              formattedRows.push({ id: additionalResult, title: 'Menu Sebelumnya' });
                              formattedRows.push({ id: 5, title: 'Menu Utama' });
                            }

                          }

                          formattedData.push(...formattedRows); // Masukkan semua rows ke formattedData

                          // Lognya formatted data
                          console.log("All rows fetched: ", formattedData);

                          // Pisahkan formattedData menjadi batch 10 rows dan kirimkan setiap batch
                          const batchSize = 10;
                          for (let i = 0; i < formattedData.length; i += batchSize) {
                            const batch = formattedData.slice(i, i + batchSize);

                            // Make the Axios POST request for each batch
                            await axios({
                              method: "POST",
                              url: "https://graph.facebook.com/v12.0/" + phone_number_id + "/messages?access_token=" + token,
                              data: {
                                messaging_product: "whatsapp",
                                to: from,
                                type: "interactive",
                                "interactive": {
                                  "type": "list",
                                  "header": {
                                    "type": "text",
                                    "text": header
                                  },
                                  "body": {
                                    "text": message
                                  },
                                  "action": {
                                    "button": "Menu",
                                    "sections": [{
                                      "title": "Pilih menu dibawah ini",
                                      rows: batch // Use the current batch of rows here
                                    }]
                                  }
                                }
                              },
                              headers: { "Content-Type": "application/json" },
                            });

                            console.log(`Batch ${i / batchSize + 1} sent successfully.`);
                          }
                        } catch (error) {
                          console.error("Error:", error);
                        }
                      }

  // Call the function to send the Facebook message
  sendFacebookMessage();
}
                    else if (type === 'interactive_back') {
                      async function sendFacebookMessage() {
                        try {
                          // Fetch additional data if required
                          const additionalResult = await new Promise((resolve, reject) => {
                            connection.query('SELECT parent FROM data WHERE id = ?', [id_title], (err, results) => {
                              if (err) {
                                console.error('Error executing the query:', err);
                                reject(err);
                              } else {
                                resolve(results[0]?.parent || null);
                              }
                            });
                          });

                          const formattedData = [];

                          if (additionalResult === 5 || additionalResult === 1) {
                            formattedData.push({ id: additionalResult, title: 'Menu Sebelumnya' });
                          } else if (additionalResult !== null) {
                            formattedData.push({ id: additionalResult, title: 'Menu Sebelumnya' });
                            formattedData.push({ id: 5, title: 'Menu Utama' });
                          }

                          // Log the formatted data
                          console.log("All rows fetched: ", formattedData);

                          // Make the Axios POST request for formattedData
                          await axios({
                            method: "POST",
                            url: "https://graph.facebook.com/v12.0/" + phone_number_id + "/messages?access_token=" + token,
                            data: {
                              messaging_product: "whatsapp",
                              to: from,
                              type: "interactive",
                              "interactive": {
                                "type": "list",
                                "header": {
                                  "type": "text",
                                  "text": header
                                },
                                "body": {
                                  "text": message
                                },
                                "action": {
                                  "button": "Menu",
                                  "sections": [{
                                    "title": "Pilih menu dibawah ini",
                                    rows: formattedData // Use the entire formattedData here
                                  }]
                                }
                              }
                            },
                            headers: { "Content-Type": "application/json" },
                          });

                          console.log("Message sent successfully.");
                        } catch (error) {
                          console.error("Error:", error);
                        }
                      }

                      // Call the function to send the Facebook message
                      sendFacebookMessage();
}


                    else {
                      console.log('Theres no determinable message type in this cell');
                    }

                  }
                }

                sendMessages();
              } else {
                console.log('No query results or invalid result format.');
              }
            })
            .catch(error => {
              console.error('Error executing the query: ' + error);
            });

      }
      if(typeof req.body.entry[0].changes[0].value.messages[0].text != 'undefined'){
        let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload

        // Function to check if the string contains "Login"
        function containsLoginKeyword(str) {
          return str.toLowerCase().includes('login');
        }

        function containsSKPMLoginKeyword(str) {
          return str.toLowerCase().includes('cek skpm');
        }

        // Function to extract name and student ID from the string
        function extractNameAndStudentID(str) {
          const matches = str.match(/Login : (.+), (\d+)/);

          if (matches) {
            let name = matches[1].trim();
            name = name.toLowerCase();
            const studentID = matches[2].trim();
            console.log('Heres the result', name , studentID);

            return { name, studentID };
          }
          return null;
        }

        function extractNameAndStudentIDforSKPM(str) {
          const matches = str.match(/Cek SKPM : (.+), (\d+)/);

          if (matches) {
            let name = matches[1].trim();
            name = name.toLowerCase();
            const studentID = matches[2].trim();
            console.log('Heres the result', name , studentID);

            return { name, studentID };
          }
          return null;
        }

        function capitalizeEachWord(str) {
          // Split the string into words
          const words = str.split(' ');

          // Capitalize the first letter of each word
          const capitalizedWords = words.map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          });

          // Join the capitalized words back into a single string
          return capitalizedWords.join(' ');
        }


        if (containsLoginKeyword(msg_body)) {
            const { name, studentID } = extractNameAndStudentID(msg_body);

            if (name && studentID) {
              (async () => {
                try {

                  connection.query(`SELECT * FROM mahasiswa WHERE LOWER(nama) LIKE '%${name}%' AND npm LIKE ${studentID}`, (err, results) => {
                    if (err) {
                      console.error('Error executing the query: ' + err);
                      // reject(err);
                    } else {
                      console.log('Heres the result: ', results);
                      if (results.length > 0) {
                        console.log('Login is valid. User found in the database.');


                        //Login Menu
                        const default_login = () => {
                          return new Promise((resolve, reject) => {
                            connection.query(query_login, (err, results) => {
                              if (err) {
                                console.error('Error executing the query: ' + err);
                                reject(err);
                              } else {
                                queryResult = results;
                                // console.log('Query results:', queryResult);
                                // for (const result of queryResult) {
                                //   console.log('Query body result:', result);
                                //   if (result && result.body) {
                                //     const body = result.body;
                                //     console.log('Query body result:', result.id);
                                //     console.log('Query body result:', result.parent);
                                //     console.log('Query body result:', result.type);
                                //     console.log('Query body result:', result.header);
                                //     console.log('Query body result:', result.body);
                                //   } else {
                                //     console.log('Invalid query result format:', result);
                                //   }
                                // }
                                resolve(results);
                              }
                            });
                          });
                        };

                        default_login()
                            .then(() => {
                              // 'queryResult' is now defined with the query results
                              console.log('Query results:', queryResult);

                              // Ensure queryResult is an array and has data
                              if (Array.isArray(queryResult) && queryResult.length > 0) {
                                for (const result of queryResult) {
                                  if (result && result.body) {
                                    const body = result.body;
                                    // console.log('Query body result:', body);
                                  } else {
                                    console.log('Invalid query result format:', result);
                                  }
                                }

                                async function sendMessages() {
                                  for (const messageObj of queryResult) {
                                    const id = messageObj.id;
                                    const parent = messageObj.parent;
                                    const type = messageObj.type;
                                    const header = messageObj.header;
                                    const message = messageObj.body;

                                    if (type == 'text'){
                                      try {
                                        await axios({
                                          method: "POST",
                                          url:
                                            "https://graph.facebook.com/v12.0/" +
                                            phone_number_id +
                                            "/messages?access_token=" +
                                            token,
                                            data: {
                                              messaging_product: "whatsapp",
                                              to: from,
                                              text: {
                                                body: message
                                              },
                                            },
                                          headers: { "Content-Type": "application/json" },
                                        });
                                        console.log(`Message sent: ${message}`);
                                      } catch (error) {
                                        console.error('Error sending message:', error);
                                      }
                                    }
                                    else if (type == 'interactive') {
                                      async function sendFacebookMessage() {
                                        try {
                                          const formattedData = []; // Define formattedData outside the query function

                                          connection.query('SELECT id,parent, body FROM data WHERE type = "row" AND parent=5', async (error, row_results) => {
                                            if (error) throw error;

                                            // Process the fetched data and structure it
                                            let formattedRows = row_results.map(row => ({
                                              id: row.id,
                                              title: row.body
                                            }));

                                            // Add the formatted rows to formattedData
                                            formattedData.push(...formattedRows);

                                            // Check if row_results[0].parent is 1
                                            if (row_results[0].parent === 5) {
                                              // formattedData.push({ id: 1, title: 'Menu Utama' });
                                            } else {
                                              // Add 'Menu Sebelumnya' at the end of formattedRows
                                              formattedData.push({ id: row_results[0].parent, title: 'Menu Sebelumnya' });
                                              formattedData.push({ id: 5, title: 'Menu Utama' });
                                            }

                                            // Log the formatted data
                                            console.log("All rows fetched: ", formattedData);

                                            try {
                                              // Split formattedData into batches of 10 rows and send each batch
                                              const batchSize = 10;
                                              for (let i = 0; i < formattedData.length; i += batchSize) {
                                                const batch = formattedData.slice(i, i + batchSize);

                                                // Make the Axios POST request for each batch
                                                await axios({
                                                  method: "POST",
                                                  url: "https://graph.facebook.com/v12.0/" + phone_number_id + "/messages?access_token=" + token,
                                                  data: {
                                                    messaging_product: "whatsapp",
                                                    to: from,
                                                    type: "interactive",
                                                    "interactive": {
                                                      "type": "list",
                                                      "header": {
                                                        "type": "text",
                                                        "text": header
                                                      },
                                                      "body": {
                                                        "text": message
                                                      },
                                                      "action": {
                                                        "button": "Menu",
                                                        "sections": [{
                                                          "title": "Pilih menu dibawah ini",
                                                          rows: batch // Use the current batch of rows here
                                                        }]
                                                      }
                                                    }
                                                  },
                                                  headers: { "Content-Type": "application/json" },
                                                });

                                                console.log(`Batch ${i / batchSize + 1} sent successfully.`);
                                              }
                                            } catch (error) {
                                              console.error("Error sending messages:", error.message);
                                            }
                                          });
                                        } catch (error) {
                                          console.error('Error executing the query: ' + error);
                                        }
                                      }

                                      // Call the function to send the Facebook message
                                      sendFacebookMessage();



                                    }
                                    else {
                                      console.log('Theres no determinable message type in this cell');
                                    }

                                  }
                                }

                                sendMessages();
                              } else {
                                console.log('No query results or invalid result format.');
                              }
                            })
                            .catch(error => {
                              console.error('Error executing the query: ' + error);
                            });


                      } else {
                        console.log('Login is invalid. User not found in the database.');
                      }
                    }
                  });
                } catch (error) {
                  console.error('Error querying the database:', error);
                }
              })();
            } else {
              console.log('Invalid format for name and student ID.');
            }
          }
        else if (containsSKPMLoginKeyword(msg_body)) {
            const { name, studentID } = extractNameAndStudentIDforSKPM(msg_body);

            if (name && studentID) {
              (async () => {
                try {

                  connection.query(`SELECT * FROM mahasiswa WHERE LOWER(nama) LIKE '%${name}%' AND npm LIKE ${studentID}`, (err, results) => {
                    if (err) {
                      console.error('Error executing the query: ' + err);
                      // reject(err);
                    } else {
                      console.log('Heres the result: ', results);
                      if (results.length > 0) {
                        console.log('Login is valid. User found in the database.');

                        const userData = results[0];
                        const skpmPoin = userData.skpm;

                        const messageSKPM = `Nama : ${name}\r\nNPM : ${studentID}\r\nPoin SKPM anda adalah : ${skpmPoin}`;

                        //Login Menu
                        const default_SKPM = () => {
                          return new Promise((resolve, reject) => {
                            connection.query(query_SKPM, (err, results) => {
                              if (err) {
                                console.error('Error executing the query: ' + err);
                                reject(err);
                              } else {
                                queryResult = results;
                                // console.log('Query results:', queryResult);
                                // for (const result of queryResult) {
                                //   console.log('Query body result:', result);
                                //   if (result && result.body) {
                                //     const body = result.body;
                                //     console.log('Query body result:', result.id);
                                //     console.log('Query body result:', result.parent);
                                //     console.log('Query body result:', result.type);
                                //     console.log('Query body result:', result.header);
                                //     console.log('Query body result:', result.body);
                                //   } else {
                                //     console.log('Invalid query result format:', result);
                                //   }
                                // }
                                resolve(results);
                              }
                            });
                          });
                        };

                        default_SKPM()
                            .then(() => {
                              // 'queryResult' is now defined with the query results
                              console.log('Query results:', queryResult);

                              // Ensure queryResult is an array and has data
                              if (Array.isArray(queryResult) && queryResult.length > 0) {
                                for (const result of queryResult) {
                                  if (result && result.body) {
                                    const body = result.body;
                                    // console.log('Query body result:', body);
                                  } else {
                                    console.log('Invalid query result format:', result);
                                  }
                                }

                                async function sendMessages() {
                                  for (const messageObj of queryResult) {
                                    const id = messageObj.id;
                                    const parent = messageObj.parent;
                                    const type = messageObj.type;
                                    const header = messageObj.header;
                                    const message = messageObj.body;

                                    if (type == 'text'){
                                      try {
                                        await axios({
                                          method: "POST",
                                          url:
                                            "https://graph.facebook.com/v12.0/" +
                                            phone_number_id +
                                            "/messages?access_token=" +
                                            token,
                                            data: {
                                              messaging_product: "whatsapp",
                                              to: from,
                                              text: {
                                                body: messageSKPM
                                              },
                                            },
                                          headers: { "Content-Type": "application/json" },
                                        });
                                        console.log(`Message sent: ${message}`);
                                      } catch (error) {
                                        console.error('Error sending message:', error);
                                      }
                                    }
                                    else if (type == 'interactive') {
                                      async function sendFacebookMessage() {
                                        try {
                                          const formattedData = []; // Define formattedData outside the query function

                                          connection.query('SELECT id,parent, body FROM data WHERE type = "row" AND parent=5', async (error, row_results) => {
                                            if (error) throw error;

                                            // Process the fetched data and structure it
                                            let formattedRows = row_results.map(row => ({
                                              id: row.id,
                                              title: row.body
                                            }));

                                            // Add the formatted rows to formattedData
                                            formattedData.push(...formattedRows);

                                            // // Check if row_results[0].parent is 1
                                            // if (row_results[0].parent === 5) {
                                            //   // formattedData.push({ id: 1, title: 'Menu Utama' });
                                            // } else {
                                            //   // Add 'Menu Sebelumnya' at the end of formattedRows
                                            //   formattedData.push({ id: row_results[0].parent, title: 'Menu Sebelumnya' });
                                            //   formattedData.push({ id: 5, title: 'Menu Utama' });
                                            // }

                                            // Log the formatted data
                                            console.log("All rows fetched: ", formattedData);

                                            try {
                                              // Split formattedData into batches of 10 rows and send each batch
                                              const batchSize = 10;
                                              for (let i = 0; i < formattedData.length; i += batchSize) {
                                                const batch = formattedData.slice(i, i + batchSize);

                                                // Make the Axios POST request for each batch
                                                await axios({
                                                  method: "POST",
                                                  url: "https://graph.facebook.com/v12.0/" + phone_number_id + "/messages?access_token=" + token,
                                                  data: {
                                                    messaging_product: "whatsapp",
                                                    to: from,
                                                    type: "interactive",
                                                    "interactive": {
                                                      "type": "list",
                                                      "header": {
                                                        "type": "text",
                                                        "text": header
                                                      },
                                                      "body": {
                                                        "text": message
                                                      },
                                                      "action": {
                                                        "button": "Menu",
                                                        "sections": [{
                                                          "title": "Pilih menu dibawah ini",
                                                          rows: batch // Use the current batch of rows here
                                                        }]
                                                      }
                                                    }
                                                  },
                                                  headers: { "Content-Type": "application/json" },
                                                });

                                                console.log(`Batch ${i / batchSize + 1} sent successfully.`);
                                              }
                                            } catch (error) {
                                              console.error("Error sending messages:", error.message);
                                            }
                                          });
                                        } catch (error) {
                                          console.error('Error executing the query: ' + error);
                                        }
                                      }

                                      // Call the function to send the Facebook message
                                      sendFacebookMessage();



                                    }
                                    else if (type === 'interactive_back') {
                                      async function sendFacebookMessage() {
                                        try {
                                          // Fetch additional data if required
                                          const additionalResult = await new Promise((resolve, reject) => {
                                            connection.query('SELECT parent FROM data WHERE id = 19', (err, results) => {
                                              if (err) {
                                                console.error('Error executing the query:', err);
                                                reject(err);
                                              } else {
                                                resolve(results[0]?.parent || null);
                                              }
                                            });
                                          });

                                          const formattedData = [];

                                          if (additionalResult === 5 || additionalResult === 1) {
                                            formattedData.push({ id: additionalResult, title: 'Menu Sebelumnya' });
                                          } else if (additionalResult !== null) {
                                            formattedData.push({ id: additionalResult, title: 'Menu Sebelumnya' });
                                            formattedData.push({ id: 5, title: 'Menu Utama' });
                                          }

                                          // Log the formatted data
                                          console.log("All rows fetched: ", formattedData);

                                          // Make the Axios POST request for formattedData
                                          await axios({
                                            method: "POST",
                                            url: "https://graph.facebook.com/v12.0/" + phone_number_id + "/messages?access_token=" + token,
                                            data: {
                                              messaging_product: "whatsapp",
                                              to: from,
                                              type: "interactive",
                                              "interactive": {
                                                "type": "list",
                                                "header": {
                                                  "type": "text",
                                                  "text": header
                                                },
                                                "body": {
                                                  "text": message
                                                },
                                                "action": {
                                                  "button": "Menu",
                                                  "sections": [{
                                                    "title": "Pilih menu dibawah ini",
                                                    rows: formattedData // Use the entire formattedData here
                                                  }]
                                                }
                                              }
                                            },
                                            headers: { "Content-Type": "application/json" },
                                          });

                                          console.log("Message sent successfully.");
                                        } catch (error) {
                                          console.error("Error:", error);
                                        }
                                      }

                                      // Call the function to send the Facebook message
                                      sendFacebookMessage();
                }
                                    else {
                                      console.log('Theres no determinable message type in this cell');
                                    }

                                  }
                                }

                                sendMessages();
                              } else {
                                console.log('No query results or invalid result format.');
                              }
                            })
                            .catch(error => {
                              console.error('Error executing the query: ' + error);
                            });


                      } else {
                        console.log('Login is invalid. User not found in the database.');
                      }
                    }
                  });
                } catch (error) {
                  console.error('Error querying the database:', error);
                }
              })();
            } else {
              console.log('Invalid format for name and student ID.');
            }
          }


        else {
          // Wrap the query in a Promise
          const default_pembukaan = () => {
            return new Promise((resolve, reject) => {
              connection.query(query_awal, (err, results) => {
                if (err) {
                  console.error('Error executing the query: ' + err);
                  reject(err);
                } else {
                  queryResult = results;
                  // console.log('Query results:', queryResult);
                  // for (const result of queryResult) {
                  //   console.log('Query body result:', result);
                  //   if (result && result.body) {
                  //     const body = result.body;
                  //     console.log('Query body result:', result.id);
                  //     console.log('Query body result:', result.parent);
                  //     console.log('Query body result:', result.type);
                  //     console.log('Query body result:', result.header);
                  //     console.log('Query body result:', result.body);
                  //   } else {
                  //     console.log('Invalid query result format:', result);
                  //   }
                  // }
                  resolve(results);
                }
              });
            });
          };

          default_pembukaan()
              .then(() => {

                console.log('Query results:', queryResult);


                if (Array.isArray(queryResult) && queryResult.length > 0) {
                  for (const result of queryResult) {
                    if (result && result.body) {
                      const body = result.body;
                      console.log('Query body result:', body);
                    } else {
                      console.log('Invalid query result format:', result);
                    }
                  }

                  async function sendMessages() {
                    for (const messageObj of queryResult) {
                      const message = messageObj.body;
                      try {
                        await axios({
                          method: "POST",
                          url:
                            "https://graph.facebook.com/v12.0/" +
                            phone_number_id +
                            "/messages?access_token=" +
                            token,
                          data: {
                            messaging_product: "whatsapp",
                            to: from,
                            text: {
                              body: message
                            },
                          },
                          headers: { "Content-Type": "application/json" },
                        });
                        console.log(`Message sent: ${message}`);
                      } catch (error) {
                        console.error('Error sending message:', error);
                      }
                    }
                  }

                  sendMessages();
                } else {
                  console.log('No query results or invalid result format.');
                }
              })
              .catch(error => {
                console.error('Error executing the query: ' + error);
              });





        }
      }


    }
    res.sendStatus(200);
  } else {

    res.sendStatus(404);
  }
});


// Add support for GET requests to Facebook webhook
app.use("/*", (req, res) => {
  // Parse the query params
  var mode = req.query["hub.mode"];
  var token = req.query["hub.verify_token"];
  var challenge = req.query["hub.challenge"];

  console.log("-------------- New Request GET --------------");
  console.log("Headers:"+ JSON.stringify(req.headers, null, 3));
  console.log("Body:"+ JSON.stringify(req.body, null, 3));

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      console.log("Responding with 403 Forbidden");
      // Respond with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  } else {
    console.log("Replying Thank you.");
    res.json({ message: "Thank you for the messagggggggggggggggggggggg" });
  }
});

app.listen(port, function () {
   console.log(`Example Facebook app listening at ${port}`)
})
