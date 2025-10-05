# Inquiry Form Update Plan

## Overview
Update the inquiry form to send data in the required format with inquiryType defaulted to "VIEWING_REQUEST" and not shown in the frontend.

## Tasks
- [x] Update InquiryModal.tsx to include inquiryType, propertyId, and userId in the data sent to the server
- [x] Set inquiryType to "VIEWING_REQUEST" as default without showing it in the UI
- [x] Change field names: name -> fullName, phone -> phoneNumber
- [x] Set userId to 1 (as per example)
- [ ] Test the form submission to ensure correct data is sent

## Files to Edit
- src/components/InquiryModal.tsx

## Follow-up
- Verify the API call sends the correct JSON structure
