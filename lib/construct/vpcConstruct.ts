import { Construct } from 'constructs';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';

export interface VpcConstructProps {

}

export class VpcConstruct extends Construct {
  public readonly vpc: ec2.Vpc
  public readonly secondVpc: ec2.Vpc

  constructor(scope: Construct, id: string, props: VpcConstructProps) {
    super(scope, id);

    this.vpc = new ec2.Vpc(this, 'Vpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      natGateways: 0,
      enableDnsHostnames: true,
      enableDnsSupport: true
    })

    this.secondVpc = new ec2.Vpc(this, 'SecondVpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.1.0.0/16'),
      natGateways: 0,
      enableDnsHostnames: true,
      enableDnsSupport: true
    })


  }
}