<template>
  <client-only>
    <div class="profile-edit-container">
      <!-- Avatar Upload -->
      <FireMoleculesFormsFirestoreAvatarSelection
        :user="{
          ...props.supplier,
          avatar_url: props.supplier?.avatarUrl,
        }"
      />

      <!-- Business Name Field (Primary Identifier) -->
      <FireMoleculesFormsFirestoreField
        label="Business Name"
        :firebase-value="props.supplier?.business_name"
        placeholder="Enter your business name"
        :update-function="updateBusinessName"
      />

      <!-- Company Name Field -->
      <FireMoleculesFormsFirestoreField
        label="Company Name"
        :firebase-value="props.supplier?.company_name"
        placeholder="Enter your company name"
        :update-function="updateCompanyName"
      />

      <!-- Business Type Field -->
      <FireMoleculesFormsFirestoreField
        label="Business Type"
        :firebase-value="props.supplier?.business_type"
        placeholder="e.g., Food Distributor, Equipment Supplier, Organic Farm"
        :update-function="updateBusinessType"
      />

      <!-- Bio Short Field -->
      <FireMoleculesFormsFirestoreField
        label="Short Description"
        :firebase-value="props.supplier?.bio_short"
        placeholder="Brief description of your business..."
        type="textarea"
        :rows="3"
        :maxlength="200"
        :update-function="updateBioShort"
      />

      <!-- Bio Long Field -->
      <FireMoleculesFormsFirestoreField
        label="Detailed Description"
        :firebase-value="props.supplier?.bio_long"
        placeholder="Detailed description of your products and services..."
        type="textarea"
        :rows="6"
        :maxlength="1000"
        :update-function="updateBioLong"
      />

      <!-- Specialties Array -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Specialties"
        :firebase-value="props.supplier?.specialties || []"
        item-placeholder="Specialty"
        new-item-placeholder="Add specialty (e.g., Organic Produce, Kitchen Equipment, etc.)"
        :update-function="updateSpecialties"
      />

      <!-- Products Offered Array -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Products Offered"
        :firebase-value="props.supplier?.products_offered || []"
        item-placeholder="Product"
        new-item-placeholder="Add product category"
        :update-function="updateProductsOffered"
      />

      <!-- Years in Business Field -->
      <FireMoleculesFormsFirestoreField
        label="Years in Business"
        :firebase-value="props.supplier?.years_in_business"
        placeholder="Enter number of years"
        type="number"
        :update-function="updateYearsInBusiness"
      />

      <!-- Employee Count Field -->
      <FireMoleculesFormsFirestoreField
        label="Employee Count"
        :firebase-value="props.supplier?.employee_count"
        placeholder="Number of employees"
        type="number"
        :update-function="updateEmployeeCount"
      />

      <!-- Contact Information -->
      <FireMoleculesFormsFirestoreField
        label="Email"
        :firebase-value="props.supplier?.email"
        placeholder="business@example.com"
        type="email"
        :update-function="updateEmail"
      />

      <FireMoleculesFormsFirestoreField
        label="Phone"
        :firebase-value="props.supplier?.phone"
        placeholder="(123) 456-7890"
        type="phone"
        :update-function="updatePhone"
      />

      <FireMoleculesFormsFirestoreField
        label="Website"
        :firebase-value="props.supplier?.website"
        placeholder="https://yourwebsite.com"
        type="url"
        :update-function="updateWebsite"
      />

      <!-- Location Information -->
      <FireMoleculesFormsFirestoreMultiField
        label="Primary Location"
        :firebase-value="props.supplier?.location || {}"
        :placeholders="{
          city: 'City',
          state: 'State/Province',
          country: 'Country',
        }"
        :update-function="updateLocation"
        :commas="true"
      />

      <!-- Delivery Range -->
      <FireMoleculesFormsFirestoreField
        label="Delivery Range"
        :firebase-value="props.supplier?.delivery_range"
        placeholder="e.g., 50km radius, Regional, National"
        :update-function="updateDeliveryRange"
      />

      <!-- Certifications Array -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Certifications"
        :firebase-value="props.supplier?.certifications || []"
        item-placeholder="Certification"
        new-item-placeholder="Add certification (e.g., Organic, HACCP, ISO, etc.)"
        :update-function="updateCertifications"
      />

      <!-- Social Links -->
      <FireMoleculesFormsFirestoreSocialLinks
        label="Social Media"
        :firebase-value="props.supplier?.social_links || {}"
        :update-function="updateSocialLinks"
      />

      <!-- Business Status Select -->
      <FireMoleculesFormsFirestoreSelect
        label="Business Status"
        :firebase-value="props.supplier?.business_status || 'active'"
        :options="[
          { label: 'Active', value: 'active' },
          { label: 'Seasonal', value: 'seasonal' },
          { label: 'By Appointment', value: 'appointment' },
          { label: 'Temporarily Closed', value: 'closed' },
        ]"
        placeholder="Select business status"
        :update-function="updateBusinessStatus"
      />

      <!-- Verified Checkbox -->
      <FireMoleculesFormsFirestoreCheckbox
        label="Profile Verification"
        :firebase-value="props.supplier?.verified || false"
        checkbox-label="Mark as verified supplier profile"
        :update-function="updateVerified"
      />
    </div>
  </client-only>
</template>

<script setup>
import { supplierConfig } from '../../../../models/profiles/Supplier.model'

// Define props
const props = defineProps({
  supplier: {
    type: Object,
    required: true,
  },
})

// Get generic profile update functions
const { updateProfile } = useProfileUpdate(supplierConfig)

// Create field-specific update functions
const updateBusinessName = (value) =>
  updateProfile({ business_name: value }, props.supplier.uid)
const updateCompanyName = (value) =>
  updateProfile({ company_name: value }, props.supplier.uid)
const updateBusinessType = (value) =>
  updateProfile({ business_type: value }, props.supplier.uid)
const updateBioShort = (value) =>
  updateProfile({ bio_short: value }, props.supplier.uid)
const updateBioLong = (value) =>
  updateProfile({ bio_long: value }, props.supplier.uid)
const updateSpecialties = (value) =>
  updateProfile({ specialties: value }, props.supplier.uid)
const updateProductsOffered = (value) =>
  updateProfile({ products_offered: value }, props.supplier.uid)
const updateYearsInBusiness = (value) =>
  updateProfile({ years_in_business: parseInt(value) || 0 }, props.supplier.uid)
const updateEmployeeCount = (value) =>
  updateProfile({ employee_count: parseInt(value) || 0 }, props.supplier.uid)
const updateEmail = (value) =>
  updateProfile({ email: value }, props.supplier.uid)
const updatePhone = (value) =>
  updateProfile({ phone: value }, props.supplier.uid)
const updateWebsite = (value) =>
  updateProfile({ website: value }, props.supplier.uid)
const updateLocation = (value) =>
  updateProfile({ location: value }, props.supplier.uid)
const updateDeliveryRange = (value) =>
  updateProfile({ delivery_range: value }, props.supplier.uid)
const updateCertifications = (value) =>
  updateProfile({ certifications: value }, props.supplier.uid)
const updateSocialLinks = (value) =>
  updateProfile({ social_links: value }, props.supplier.uid)
const updateBusinessStatus = (value) =>
  updateProfile({ business_status: value }, props.supplier.uid)
const updateVerified = (value) =>
  updateProfile({ verified: value }, props.supplier.uid)
</script>
