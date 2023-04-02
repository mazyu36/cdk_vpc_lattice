import { LambdaConstruct } from './construct/lambdaConstruct';
import { Ec2Construct } from './construct/ec2Construct';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { VpcConstruct } from './construct/vpcConstruct';
import { VpcLatticeConstruct } from './construct/vpcLatticeConstruct';

export class CdkVpcLatticeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpcConstruct = new VpcConstruct(this, 'VpcConstruct', {})

    const ec2Construct = new Ec2Construct(this, 'Ec2Construct', {
      vpcConstruct
    })

    const lambdaConstruct = new LambdaConstruct(this, 'LambdaConstruct', {})

    new VpcLatticeConstruct(this, 'VpcLatticeConstruct', {
      vpcConstruct,
      ec2Construct,
      lambdaConstruct
    })
  }
}
