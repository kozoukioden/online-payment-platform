import glob

for f in glob.glob('c:/Users/user/Desktop/alm/onlinepaymentplatform-clone-perfect/*.html'):
    with open(f, 'a', encoding='utf-8') as file:
        file.write('\n<script src="/chat.js"></script>\n')

print("Chat injected!")
