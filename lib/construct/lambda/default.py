import json

def handler(event, context):
    print('default Lambda Invoked')
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Default Lambda!')
    }