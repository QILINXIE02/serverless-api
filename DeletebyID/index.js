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
        // Extract the 'id' from path parameters
        const personId = event.pathParameters.id;

        // Delete the person by id
        await peopleModel.delete({ id: personId });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Person deleted successfully' }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
