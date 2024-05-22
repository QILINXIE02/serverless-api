const dynamoose = require('dynamoose');

// Define the schema for the DynamoDB table
const schema = new dynamoose.Schema({
    id: {
        type: String,
        hashKey: true, // Mark 'id' as the primary key
        required: true
    },
    name: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    }
});

// Define the model for the table
const peopleModel = dynamoose.model('People', schema);

exports.handler = async (event) => {
    try {
        let parsedBody;
        let response;

        // Determine the HTTP method
        const httpMethod = event.httpMethod;

        if (httpMethod === 'POST') {
            // Parse the body based on whether it is base64 encoded or not
            if (event.isBase64Encoded) {
                const decodedBody = Buffer.from(event.body, 'base64').toString('utf8');
                parsedBody = JSON.parse(decodedBody);
            } else {
                parsedBody = JSON.parse(event.body);
            }

            // Check if the required 'id' field is present in the parsed body
            if (!parsedBody.id) {
                throw new Error("Missing the key 'id' in the item");
            }

            // Log the parsed body
            console.log(parsedBody);

            // Perform DynamoDB operation using parsedBody
            let newPerson = await peopleModel.create(parsedBody);
            response = {
                statusCode: 200,
                body: JSON.stringify(newPerson),
            };
        } else if (httpMethod === 'GET') {
            if (event.queryStringParameters && event.queryStringParameters.id) {
                // Get by ID
                const personId = event.queryStringParameters.id;

                // Retrieve the person by id
                let person = await peopleModel.get({ id: personId });

                // If person is not found, return a 404 response
                if (!person) {
                    response = {
                        statusCode: 404,
                        body: JSON.stringify({ error: 'Person not found' }),
                    };
                } else {
                    response = {
                        statusCode: 200,
                        body: JSON.stringify(person),
                    };
                }
            } else {
                // Get all
                let people = await peopleModel.scan().exec();
                response = {
                    statusCode: 200,
                    body: JSON.stringify(people),
                };
            }
        } else if (httpMethod === 'PUT') {
            // Parse the body based on whether it is base64 encoded or not
            if (event.isBase64Encoded) {
                const decodedBody = Buffer.from(event.body, 'base64').toString('utf8');
                parsedBody = JSON.parse(decodedBody);
            } else {
                parsedBody = JSON.parse(event.body);
            }

            // Check if the required 'id' field is present in the parsed body
            if (!parsedBody.id) {
                throw new Error("Missing the key 'id' in the item");
            }

            // Log the parsed body
            console.log(parsedBody);

            // Perform DynamoDB update operation using parsedBody
            let updatedPerson = await peopleModel.update({ id: parsedBody.id }, parsedBody);
            response = {
                statusCode: 200,
                body: JSON.stringify(updatedPerson),
            };
        } else if (httpMethod === 'DELETE') {
            // Extract the 'id' from query parameters
            const personId = event.queryStringParameters.id;

            // Check if 'id' is provided
            if (!personId) {
                throw new Error("Missing the key 'id' in the query parameters");
            }

            // Delete the person by id
            await peopleModel.delete({ id: personId });

            response = {
                statusCode: 200,
                body: JSON.stringify({ message: 'Person deleted successfully' }),
            };
        } else {
            response = {
                statusCode: 405,
                body: JSON.stringify({ error: `Unsupported method: ${httpMethod}` }),
            };
        }

        return response;
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
