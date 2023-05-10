terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
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

  provisioner "remote-exec" {
    inline = [
      "sudo yum update -y",
      "sudo yum install -y docker",
      "sudo systemctl start docker",
      "sudo systemctl enable docker",
      "sudo docker run -d --name neo4j -p 7474:7474 -p 7687:7687 -v ${var.mount_path}:/data neo4j"
    ]

    connection {
      type        = "ssh"
      user        = "ec2-user"
      private_key = file("/Users/nilseng/.ssh/default_pair.pem")
      host        = self.public_ip
      timeout     = "5m"
    }
  }

  tags = {
    Name = "DBServerInstance"
  }
}

locals {
  device_name = "/dev/sdf"
  mount_path  = "/mnt/neo4j"
}

variable "device_name" {
  description = "The device name to use for the EBS volume"
  default     = "/dev/sdf"
}

variable "mount_path" {
  description = "The directory to mount the EBS volume to"
  default     = "/mnt/neo4j"
}

resource "aws_ebs_volume" "db_volume" {
  availability_zone = "eu-north-1c"
  size              = "8"
  type              = "gp2"
}

resource "aws_volume_attachment" "db_volume_attachment" {
  device_name = "/dev/sdf"
  volume_id   = aws_ebs_volume.db_volume.id
  instance_id = aws_instance.db_server.id
}
