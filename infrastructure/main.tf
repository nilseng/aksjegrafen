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

resource "aws_instance" "db_server" {
  ami           = "ami-0577c11149d377ab7"
  instance_type = "t3.small"

  tags = {
    Name = "DBServerInstance"
  }
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
