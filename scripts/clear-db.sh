#!/bin/bash

# Clear all MongoDB collections for myrealtor app EXCEPT users
# Usage: ./scripts/clear-db.sh [mongodb_uri]

MONGO_URI="${1:-mongodb://localhost:27017/myrealtor}"

echo "=== MyRealtor Database Cleanup Script ==="
echo "Database: $MONGO_URI"
echo ""
echo "This will DELETE ALL records from:"
echo "  - notifications"
echo "  - properties"
echo "  - applications"
echo "  - applicationmessages"
echo "  - appointments"
echo "  - appraisalrequests"
echo "  - appraisalreports"
echo "  - titlingrequests"
echo "  - consultancyrequests"
echo "  - buyerinquiries"
echo "  - interestedbuyers"
echo "  - earnestmoneyagreements"
echo "  - documents"
echo "  - payments"
echo "  - compliancetasks"
echo "  - auditlogs"
echo "  - propertylistingrequests"
echo ""
echo "KEEPING: users"
echo ""
read -p "Are you sure you want to continue? (y/N): " confirm

if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Clearing collections..."

mongosh "$MONGO_URI" --quiet --eval '
  const collections = [
    "notifications",
    "properties",
    "applications",
    "applicationmessages",
    "appointments",
    "appraisalrequests",
    "appraisalreports",
    "titlingrequests",
    "consultancyrequests",
    "buyerinquiries",
    "interestedbuyers",
    "earnestmoneyagreements",
    "documents",
    "payments",
    "compliancetasks",
    "auditlogs",
    "propertylistingrequests"
  ];

  let totalDeleted = 0;

  collections.forEach(col => {
    const collection = db.getCollection(col);
    const count = collection.countDocuments();
    if (count > 0) {
      const result = collection.deleteMany({});
      console.log(`  ${col}: deleted ${result.deletedCount} records`);
      totalDeleted += result.deletedCount;
    } else {
      console.log(`  ${col}: (empty)`);
    }
  });

  console.log("");
  console.log(`Total records deleted: ${totalDeleted}`);
  console.log("Users collection preserved.");
'

echo ""
echo "Done!"
