# Common password blocklist

`commonPasswords.json` contains the first **100 non-empty entries** from SecLists' `Passwords/Common-Credentials/xato-net-10-million-passwords-1000.txt`, followed by **12 project-maintained predictable long values**. The longer entries make the blocklist useful alongside the 15-character minimum. These public examples are not application credentials.

Source: https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/xato-net-10-million-passwords-1000.txt

Upstream Git blob SHA: `f27829da19a17b294d940863a6d5f9cabf15d2e1`. Retrieved on 9 November 2026. The application reads the committed JSON offline; it makes no password-checking network requests.

Lookup uses NFKC normalization, surrounding-space removal and lowercase for an entire-password match. This lookup does not alter the value sent to bcrypt. Words inside an otherwise different passphrase are not blocked. This small list does not establish that a password has never appeared in a breach.

The upstream data is distributed under the following license:

MIT License

Copyright (c) 2018 Daniel Miessler

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
