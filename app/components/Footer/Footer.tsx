import React from 'react';

const Footer: React.FC = () => {
  const infoLinks = [
    { name: '오용민', url: 'https://github.com/OHYONGMAN' },
    { name: '장나리', url: 'https://github.com/nanaazzipgithub' },
    { name: '장유주', url: 'https://github.com/UZU82' },
    { name: '지명진', url: 'https://github.com/damoayo' },
    { name: '진승현', url: 'https://github.com/ynn-i' },
  ];

  return (
    <footer className="bottom-0 left-0 w-full bg-g-100 text-g-600">
      <div className="container mx-auto flex py-12">
        <img
          src="images/logo-gray.svg"
          alt="rapid stock"
          className="mr-20 h-[43px] w-[235px] object-cover"
        />
        <div>
          <ul className="grid grid-cols-3 gap-x-12">
            {infoLinks.map((infoLink, index) => (
              <li key={index}>
                <a
                  href={infoLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-g-600 hover:underline"
                >
                  {infoLink.name} | {infoLink.url}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            &copy; 2024 Rapid Stock. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
