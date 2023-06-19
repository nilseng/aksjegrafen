terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }

    null = {
      source  = "hashicorp/null"
      version = "3.2.1"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region  = "eu-north-1"
  profile = "admin"
}


data "aws_security_group" "default" {
  name = "default"
}

locals {
  security_group_id = data.aws_security_group.default.id
}

resource "aws_security_group_rule" "neo4j_browser" {
  type              = "ingress"
  from_port         = 7474
  to_port           = 7474
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = local.security_group_id
}

resource "aws_security_group_rule" "neo4j_bolt" {
  type              = "ingress"
  from_port         = 7687
  to_port           = 7687
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = local.security_group_id
}

resource "aws_security_group_rule" "ssh" {
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = local.security_group_id
}

resource "aws_instance" "db_server" {
  ami           = "ami-0577c11149d377ab7"
  instance_type = "t3.large"
  key_name      = "default_pair"

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }

  tags = {
    Name = "DBServerInstance"
  }
}

resource "aws_ebs_volume" "db_volume" {
  availability_zone = "eu-north-1c"
  size              = "16"
  type              = "gp2"
}

resource "aws_volume_attachment" "db_volume_attachment" {
  device_name = "/dev/sdf"
  volume_id   = aws_ebs_volume.db_volume.id
  instance_id = aws_instance.db_server.id
}

resource "null_resource" "setup_script" {

  # The script is rerun whenever a value in the triggers map changes, so increase the version number to rerun the script.
  triggers = {
    version = 1
  }

  depends_on = [aws_volume_attachment.db_volume_attachment]

  connection {
    type        = "ssh"
    user        = "ec2-user"
    private_key = file("/Users/nilseng/.ssh/default_pair.pem")
    host        = aws_instance.db_server.public_ip
  }

  provisioner "remote-exec" {
    inline = [
      # Formats the file system of the EBS volume, assuming it's called nvme1n1
      # Will create a new file system and existing data will be lost
      # "sudo mkfs -t ext4 /dev/nvme1n1",
      # Creates /mnt/neo4j if it doesn't exist
      "sudo mkdir -p /mnt/neo4j",
      # Mounts the EBS volume to the mount path
      /* "sudo mount /dev/nvme1n1 /mnt/neo4j",
      "sudo yum update -y",
      "sudo yum install -y docker",
      "sudo systemctl start docker",
      "sudo systemctl enable docker", */
      # Creates a new docker container
      "sudo docker run -d --name neo4j -p 7474:7474 -p 7687:7687 -v /mnt/neo4j:/data -v /plugins:/var/lib/neo4j/plugins --env NEO4J_dbms_security_procedures_unrestricted=apoc.* --env NEO4J_dbms_memory_pagecache_size=5g --env NEO4J_db_transaction_timeout=20s neo4j"
    ]
  }
}
