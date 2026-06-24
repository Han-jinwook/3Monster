import io

with io.open(r'd:\3Monster\admin-dashboard\src\pages\LicenseGenerator.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("license_type: 'TRIAL',", "license_type: 'DELUXE',")
content = content.replace("['TRIAL', '1M', '3M']", "['DELUXE', '1M', '3M']")
content = content.replace("const isTrial = formData.license_type === 'TRIAL';", "const isDeluxe = formData.license_type === 'DELUXE';")
content = content.replace("} else if (isTrial) {", "} else if (isDeluxe) {")
content = content.replace("""            if (formData.license_type === 'TRIAL') {
                expireDate.setDate(now.getDate() + 5);
                collectionLimit = 1000;
            } else if (formData.license_type === 'TEST') {
                expireDate.setDate(now.getDate() + 1);
                collectionLimit = 100;
            }""", """            if (formData.license_type === 'DELUXE') {
                expireDate.setMonth(now.getMonth() + 1);
                collectionLimit = 1000;
            } else if (formData.license_type === 'TEST') {
                expireDate.setFullYear(now.getFullYear() + 100);
                collectionLimit = 50;
            }""")
content = content.replace("""                                        <select
                                            className="w-full h-14 rounded-xl bg-white px-4 text-base font-extrabold border border-slate-400 focus:border-indigo-650 focus:ring-4 focus:ring-indigo-150 outline-none transition-all appearance-none cursor-pointer text-indigo-900"
                                            value={formData.license_type}
                                            onChange={(e) => handleLicenseTypeChange(e.target.value)}
                                        >
                                            <option value="TRIAL">DELUXE (5일 / 1,000건 제한)</option>
                                            <option value="1M">STANDARD (1개월 이용권)</option>
                                            <option value="3M">PREMIUM (3개월 이용권)</option>
                                        </select>""", """                                        <select
                                            className="w-full h-14 rounded-xl bg-white px-4 text-base font-extrabold border border-slate-400 focus:border-indigo-650 focus:ring-4 focus:ring-indigo-150 outline-none transition-all appearance-none cursor-pointer text-indigo-900"
                                            value={formData.license_type}
                                            onChange={(e) => handleLicenseTypeChange(e.target.value)}
                                        >
                                            <option value="DELUXE">디럭스 (1개월 / 1,000건 제한)</option>
                                            <option value="1M">STANDARD (1개월 이용권)</option>
                                            <option value="3M">PREMIUM (3개월 이용권)</option>
                                            <option value="TEST">무료체험판 수동 발급 (무기한 / 50건 제한)</option>
                                        </select>""")
content = content.replace("buyer_name: `${formData.buyer_name} ${isTrial ? '(TRIAL)' : ''}`.trim(),", "buyer_name: formData.buyer_name.trim(),")

with io.open(r'd:\3Monster\admin-dashboard\src\pages\LicenseGenerator.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
