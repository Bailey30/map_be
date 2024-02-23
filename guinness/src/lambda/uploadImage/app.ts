import AWS from "aws-sdk"
import { APIGatewayProxyEvent } from "aws-lambda"
const s3 = new AWS.S3()

export const uploadImage = async(event: APIGatewayProxyEvent)=>{
    try {
        if (event.httpMethod !== "POST") {
            throw new Error(`postMethod only accepts POST  method, you tried: ${event.httpMethod} method`)
        }
        console.log('received:', event)
        const body = JSON.parse(event.body!)
        const key = body.key
        const s3Params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Expires: 30000,
            ContentType: 'image/jpeg'
        }

        let uploadURL = s3.getSignedUrl('putObject', s3Params)

        return {
            status: 200,
            body: JSON.stringify({
                uploadURL: uploadURL,
                filename: key,
                message: "Successfully created unsigned url to send image to S3 bucket"
            })
            ,
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        }

    } catch (err: any) {
        console.log("error occuring trying to create unsigned url", err)
        return {
            status: 500,
            body: JSON.stringify({
                message: "Error trying to create unsigned url",
                error: err,
            })
        }
    }
}
