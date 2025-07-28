import React from 'react';
import { Linkedin, Twitter, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TeamMember = ({ name, name_ar, position, position_ar, bio, bio_ar, image, social }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const currentName = isArabic && name_ar ? name_ar : name;
  const currentPosition = isArabic && position_ar ? position_ar : position;
  const currentBio = isArabic && bio_ar ? bio_ar : bio;

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-all w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center">
        <img
          src={image}
          alt={currentName}
          className="w-24 h-24 md:w-32 md:h-32 rounded-full mb-3 md:mb-4 object-cover"
        />
        <h3 className="text-lg md:text-xl font-semibold text-center mb-1">{currentName}</h3>
        <p className="text-blue-600 text-xs md:text-sm text-center mb-2 md:mb-3">{currentPosition}</p>
        <p className="text-gray-600 text-sm md:text-base text-center mb-3 md:mb-4">{currentBio}</p>
        <div className="flex justify-center">
          {social.linkedin && (
            <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
              <Linkedin className="w-4 h-4 md:w-5 md:h-5 mr-2 ml-2" />
            </a>
          )}
          {social.instagram && (
            <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
              <Instagram className="w-4 h-4 md:w-5 md:h-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMember;