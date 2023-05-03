# Authentication

Run `aws configure sso` the first time a user is logging in.

Once configured, use `aws sso login --profile admin` to log in.

Requires:

- AWS CLI
- A start URL created in AWS Management Console
- A user with the admin role/profile.

# Apply terraform config

Run `terraform apply`.

# Destroy resources

Run `terraform destroy`.