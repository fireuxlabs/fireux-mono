<template>
  <client-only>
    <div class="edit-component">
      <!-- Business Information -->
      <FireMoleculesFormsFirestoreField
        label="Business Name"
        :firebase-value="props.supplier?.business_name || ''"
        placeholder="Enter your business name"
        :update-function="updateBusinessName"
      />

      <FireMoleculesFormsFirestoreField
        label="Email"
        :firebase-value="props.supplier?.email || ''"
        placeholder="Enter business email"
        type="email"
        :update-function="updateEmail"
      />

      <FireMoleculesFormsFirestoreField
        label="Title"
        :firebase-value="props.supplier?.title || ''"
        placeholder="Enter your role/title"
        :update-function="updateTitle"
      />

      <FireMoleculesFormsFirestoreField
        label="Website"
        :firebase-value="props.supplier?.website || ''"
        placeholder="Enter business website"
        type="url"
        :update-function="updateWebsite"
      />

      <!-- Business Details -->
      <FireMoleculesFormsFirestoreSelect
        label="Business Type"
        :firebase-value="props.supplier?.business_type || ''"
        :options="[
          { label: 'Farm', value: 'farm' },
          { label: 'Distributor', value: 'distributor' },
          { label: 'Manufacturer', value: 'manufacturer' },
          { label: 'Wholesaler', value: 'wholesaler' },
          { label: 'Producer', value: 'producer' },
          { label: 'Other', value: 'other' },
        ]"
        placeholder="Select business type"
        :update-function="updateBusinessType"
      />

      <FireMoleculesFormsFirestoreField
        label="Contact Person"
        :firebase-value="props.supplier?.contact_person || ''"
        placeholder="Primary contact person name"
        :update-function="updateContactPerson"
      />

      <FireMoleculesFormsFirestoreField
        label="Phone"
        :firebase-value="props.supplier?.phone || ''"
        placeholder="Business phone number"
        type="tel"
        :update-function="updatePhone"
      />

      <!-- Business Description -->
      <FireMoleculesFormsFirestoreField
        label="Short Description"
        :firebase-value="props.supplier?.bio_short || ''"
        placeholder="Brief business description"
        type="textarea"
        :rows="3"
        :update-function="updateBioShort"
      />

      <FireMoleculesFormsFirestoreField
        label="Detailed Description"
        :firebase-value="props.supplier?.bio_long || ''"
        placeholder="Detailed business description and services"
        type="textarea"
        :rows="6"
        :update-function="updateBioLong"
      />

      <!-- Business Operations -->
      <FireMoleculesFormsFirestoreField
        label="Years in Business"
        :firebase-value="props.supplier?.years_in_business?.toString() || ''"
        placeholder="How many years have you been in business?"
        type="number"
        :update-function="
          (value) => updateYearsInBusiness(parseInt(value) || 0)
        "
      />

      <FireMoleculesFormsFirestoreField
        label="Employee Count"
        :firebase-value="props.supplier?.employee_count?.toString() || ''"
        placeholder="Number of employees"
        type="number"
        :update-function="(value) => updateEmployeeCount(parseInt(value) || 0)"
      />

      <FireMoleculesFormsFirestoreField
        label="Annual Capacity"
        :firebase-value="props.supplier?.annual_capacity || ''"
        placeholder="Annual production/supply capacity"
        :update-function="updateAnnualCapacity"
      />

      <!-- Specialties & Products -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Specialties"
        :firebase-value="props.supplier?.specialties || []"
        placeholder="Add product specialties (e.g., Organic Vegetables, Dairy Products)"
        :update-function="updateSpecialties"
      />

      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Quality Standards"
        :firebase-value="props.supplier?.quality_standards || []"
        placeholder="Quality standards followed (e.g., ISO 9001, HACCP)"
        :update-function="updateQualityStandards"
      />

      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Sustainability Practices"
        :firebase-value="props.supplier?.sustainability_practices || []"
        placeholder="Sustainability initiatives (e.g., Organic Farming, Carbon Neutral)"
        :update-function="updateSustainabilityPractices"
      />

      <!-- Delivery & Services -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Delivery Methods"
        :firebase-value="props.supplier?.delivery_methods || []"
        placeholder="Available delivery methods (e.g., Truck Delivery, Pickup)"
        :update-function="updateDeliveryMethods"
      />

      <FireMoleculesFormsFirestoreField
        label="Delivery Schedule"
        :firebase-value="props.supplier?.delivery_schedule || ''"
        placeholder="Regular delivery schedule (e.g., Daily, Weekly, On-demand)"
        :update-function="updateDeliverySchedule"
      />

      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Payment Terms"
        :firebase-value="props.supplier?.payment_terms || []"
        placeholder="Available payment terms (e.g., Net 30, COD, Credit)"
        :update-function="updatePaymentTerms"
      />

      <!-- Pricing Options -->
      <div class="form-field">
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="props.supplier?.bulk_discounts || false"
            @change="updateBulkDiscounts($event.target.checked)"
          />
          Bulk Discounts Available
        </label>
      </div>

      <div class="form-field">
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="props.supplier?.seasonal_pricing || false"
            @change="updateSeasonalPricing($event.target.checked)"
          />
          Seasonal Pricing
        </label>
      </div>

      <div class="form-field">
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="props.supplier?.verified || false"
            @change="updateVerified($event.target.checked)"
          />
          Verified Supplier
        </label>
      </div>

      <div class="form-field">
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="props.supplier?.featured || false"
            @change="updateFeatured($event.target.checked)"
          />
          Featured Supplier
        </label>
      </div>

      <!-- Client Types -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Client Types Served"
        :firebase-value="props.supplier?.client_types || []"
        placeholder="Types of clients you serve (e.g., Restaurants, Hotels, Catering)"
        :update-function="updateClientTypes"
      />

      <!-- Additional Info -->
      <div class="form-note">
        <h3>Additional Information</h3>
        <p class="text-gray-600 text-sm">
          Products, certifications, testimonials, and location details can be
          managed through dedicated sections once your profile is created.
        </p>
      </div>
    </div>
  </client-only>
</template>

<script setup>
const props = defineProps({
  supplier: {
    type: Object,
    default: () => ({}),
  },
})

// Import the supplier update composable
const {
  updateBusinessName,
  updateEmail,
  updateTitle,
  updateWebsite,
  updateBusinessType,
  updateContactPerson,
  updatePhone,
  updateBioShort,
  updateBioLong,
  updateYearsInBusiness,
  updateEmployeeCount,
  updateAnnualCapacity,
  updateSpecialties,
  updateQualityStandards,
  updateSustainabilityPractices,
  updateDeliveryMethods,
  updateDeliverySchedule,
  updatePaymentTerms,
  updateBulkDiscounts,
  updateSeasonalPricing,
  updateVerified,
  updateFeatured,
  updateClientTypes,
} = useSupplierUpdate()
</script>

<style scoped>
.edit-component {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-field {
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
}

.checkbox-label input[type='checkbox'] {
  width: 16px;
  height: 16px;
}

.form-note {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
}

.form-note h3 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: #374151;
}

.form-note p {
  margin: 0;
  line-height: 1.5;
}
</style>
