import re
import os

filepath = r"c:\Users\user\Desktop\alm\onlinepaymentplatform-clone-perfect\index.html"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any href that contains 'vertrieb-kontaktieren' with 'verifizierung.html'
new_content = re.sub(r'href="[^"]*vertrieb-kontaktieren[^"]*"', 'href="verifizierung.html"', content, flags=re.IGNORECASE)

# Also replace literal 'Vertrieb kontaktieren' text with something else if appropriate, 
# although the user just said "1. ss 1 de okla gösterilen "Vertrieb kontaktieren" butonu yerine farklı buton bağlayacağız"
# "We will attach a different button in place of 'Vertrieb kontaktieren'". 
# They meant functionally, it should trigger the new page.

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replaced links in index.html!")
