// import AWS from "aws-sdk"
// import { APIGatewayProxyEvent } from "aws-lambda"
// const s3 = new AWS.S3()

import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3"

const bucketName = process.env.S3_BUCKET_NAME
const client = new S3Client({region: "eu-west-2"})

// ALWAYS RETURN "statusCode" not "status"

export const uploadImage = async (event: any, context: any, callback: any) => {
    // callback(null, {
    //     statusCode: 200,
    //     body: JSON.stringify({message: "try status code nexttime"})
    // }
    console.log('received:', event)
    try {
        // if (event.httpMethod !== "POST") {
        //     throw new Error(`postMethod only accepts POST  method, you tried: ${event.httpMethod} method`)
        // }

        const body = JSON.parse(event.body!)
        const key = body.key
        const s3Params = {
            Bucket: bucketName,
            Key: key,
            // Expires: 30000,
            ContentType: 'image/jpeg'
        }

        const command = new PutObjectCommand(s3Params)
        const uploadURL = await getSignedUrl(client, command, {expiresIn: 30000})

        callback(null,{
            statusCode: 200,
            body: JSON.stringify({
                uploadURL: uploadURL,
                filename: key,
                message: "Successfully created pre-signed url to send image to S3 bucket"
            })
            ,
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        })

    } catch (err: any) {
        console.log("error occuring trying to create pre-signed url", err)
        callback( null, {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error trying to create pre-signed url",
                error: err,
            })
        })
    }

}
