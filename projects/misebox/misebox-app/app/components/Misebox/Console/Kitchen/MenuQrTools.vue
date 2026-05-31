<template>
  <UAccordion type="single">
    <UAccordionItem
      value="qr-tools"
      title="QR tools"
    >
      <template #body>
        <div class="space-y-4">
          <MiseboxConsoleKitchenMenuUrlQr />
          <MiseboxConsoleKitchenMenuDocUpload />
        </div>
      </template>
    </UAccordionItem>
  </UAccordion>
</template>
