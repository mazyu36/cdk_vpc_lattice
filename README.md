#  VPC Lattice Sample(AWS CDK)
VPC LatticeをAWS CDK（L1 Construct）で実装したサンプル。
## アーキテクチャ
![](architecture.drawio.svg)

サービスとしては以下。

* EC2（Client）：クライアント側のEC2サーバー。ここから他のサービスにリクエストを行い通信ができるか確認する。
* Lambda：通信先のサービス（1つ目）。HTTPSで通信する。アクセスログはCW Logsに出力。
* EC2（Server）：80番ポートで公開。HTTPで通信する。アクセスログはS3バケットに出力。

## プロジェクト構成
```bash
.
├── cdk_vpc_lattice-stack.ts # Stackを定義
└── construct # Constructで構造化
    ├── lambda # Lambdaのコードを格納
    │   ├── default.py
    │   ├── first.py
    │   └── second.py
    ├── script # EC2 Server構成用のUser Dataを格納
    │   └── user-data.sh
    ├── ec2Construct.ts # EC2を定義（Client, Server）
    ├── lambdaConstruct.ts # Lambdaを定義
    ├── vpcConstruct.ts # VPCを定義
    └── vpcLatticeConstruct.ts # VPC Latticeを定義
```


## ブログ記事
[VPC LatticeをAWS CDK（L1 Construct）/ CloudFormationで実装する](https://mazyu36.hatenablog.com/entry/2023/04/03/180347)