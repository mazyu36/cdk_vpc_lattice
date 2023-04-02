import { Construct } from 'constructs';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import * as path from 'path';

export interface LambdaConstructProps {

}

export class LambdaConstruct extends Construct {
  public readonly defaultFunction: lambda.Function
  public readonly firstFunction: lambda.Function
  public readonly secondFunction: lambda.Function


  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    this.defaultFunction = new lambda.Function(this, 'DefaultFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'default.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
    })

    this.firstFunction = new lambda.Function(this, 'FirstFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'first.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
    })

    this.secondFunction = new lambda.Function(this, 'SecondFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'second.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
    })

  }
}