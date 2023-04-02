#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd
touch /var/www/html/index.html
echo "Hello VPC Lattice!" | tee -a /var/www/html/index.html