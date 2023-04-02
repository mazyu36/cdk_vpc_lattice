import { Construct } from 'constructs';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { VpcConstruct } from './vpcConstruct';
import { readFileSync } from 'fs';


export interface Ec2ConstructProps {
  vpcConstruct: VpcConstruct

}

export class Ec2Construct extends Construct {
  public readonly bastionInstance: ec2.BastionHostLinux
  public readonly serverInstance: ec2.Instance
  constructor(scope: Construct, id: string, props: Ec2ConstructProps) {
    super(scope, id);

    this.bastionInstance = new ec2.BastionHostLinux(this, 'BastionInstance', {
      vpc: props.vpcConstruct.vpc,
      subnetSelection: {
        subnetType: ec2.SubnetType.PUBLIC,
      }
    })


    const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc: props.vpcConstruct.secondVpc,
      allowAllOutbound: true
    })

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));

    this.serverInstance = new ec2.Instance(this, 'ServerInstance', {
      vpc: props.vpcConstruct.secondVpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      ssmSessionPermissions: true,
      securityGroup: securityGroup
    })

    const userDataScript = readFileSync('./lib/construct/script/user-data.sh', 'utf8');

    this.serverInstance.addUserData(userDataScript);


    // this.bastionInstance.role.addToPrincipalPolicy(
    //   new iam.PolicyStatement({
    //     actions: [
    //       'ssmmessages:CreateControlChannel',
    //       'ssmmessages:CreateDataChannel',
    //       'ssmmessages:OpenControlChannel',
    //       'ssmmessages:OpenDataChannel',
    //     ],
    //     resources: ['*'],
    //   }),


  }
}