const fs = require('fs');
const path = require('path');

const content = `export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-brand-primary mb-4">Page Under Construction</h1>
      <p className="text-gray-600">This page is being built.</p>
    </div>
  );
}`;

const files = [
  'src/app/(officer)/dashboard/page.tsx',
  'src/app/(officer)/results/page.tsx',
  'src/app/(officer)/profile/page.tsx',
  'src/app/(officer)/audit-logs/page.tsx',
  'src/app/(school-it)/dashboard/page.tsx',
  'src/app/(school-it)/students/page.tsx',
  'src/app/(school-it)/results/page.tsx',
  'src/app/(dashboard)/academic-settings/page.tsx'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log(`Created ${file}`);
});
