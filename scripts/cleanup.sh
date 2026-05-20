#!/bin/bash
# cleanup.sh — Elimina el stack completo sin errores
# Vacía el bucket S3 antes de eliminar para evitar DELETE_FAILED

STACK_NAME="${1:-code-faster-chatbot}"
REGION="${2:-us-east-1}"

echo ""
echo "Eliminando stack: $STACK_NAME (region: $REGION)"
echo ""

# Obtener nombre del bucket del stack
BUCKET_NAME=$(aws cloudformation describe-stack-resource \
  --stack-name "$STACK_NAME" \
  --logical-resource-id DocumentsBucket \
  --query "StackResourceDetail.PhysicalResourceId" \
  --output text \
  --region "$REGION" 2>/dev/null)

if [ -n "$BUCKET_NAME" ] && [ "$BUCKET_NAME" != "None" ]; then
  echo "Vaciando bucket: $BUCKET_NAME"
  aws s3 rm "s3://$BUCKET_NAME" --recursive --region "$REGION" 2>/dev/null
  echo "Bucket vaciado."
fi

# Eliminar el stack
echo "Eliminando stack de CloudFormation..."
aws cloudformation delete-stack --stack-name "$STACK_NAME" --region "$REGION"
aws cloudformation wait stack-delete-complete --stack-name "$STACK_NAME" --region "$REGION"

echo ""
echo "Stack $STACK_NAME eliminado correctamente."
