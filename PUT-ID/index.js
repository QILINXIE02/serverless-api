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

        // Perform DynamoDB update operation using parsedBody
        let updatedPerson = await peopleModel.update({ id: parsedBody.id }, parsedBody);
        return {
            statusCode: 200,
            body: JSON.stringify(updatedPerson),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
