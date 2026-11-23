variable "tenancy_ocid"     { type = string }
variable "user_ocid"        { type = string }
variable "fingerprint"      { type = string }
variable "private_key_path" { type = string }
variable "region"           { type = string }
variable "compartment_ocid" { type = string }

variable "ssh_public_key_path" {
  type    = string
  default = "C:/Users/MSI/.ssh/ssh-key-2026-11-23.key.pub"
}

# Limita SSH a tu IP, por ejemplo "190.1.2.3/32". Por defecto está abierto.
variable "ssh_allowed_cidr" {
  type    = string
  default = "0.0.0.0/0"
}

# VM.Standard.E2.1.Micro entra en Always Free (AMD).
# Para ARM Always Free usa VM.Standard.A1.Flex (y descomenta shape_config).
variable "shape" {
  type    = string
  default = "VM.Standard.E3.Flex"
}