import React, { useState } from 'react';
import axios from 'axios';
import { Version } from '../types';

interface ReusableElementToolbarProps {
  currentVersionId: string | null;
  versions: Version[];
  setVersions: React.Dispatch<React.SetStateAction<Version[]>>;
  hoveredElement: string | null;
  setHoveredElement: React.Dispatch<React.SetStateAction<string | null>>;
}

const ReusableElementToolbar: React.FC<ReusableElementToolbarProps> = ({
  currentVersionId,
  versions,
  setVersions,
  hoveredElement,
  setHoveredElement,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleDeleteReusableElement = (versionId: string, codeName: string) => {
    setVersions(prevVersions => {
      const updatedVersions = prevVersions.map(version =>
        version.id === versionId
          ? { ...version, reuseableElementList: version.reuseableElementList.filter(element => element.codeName !== codeName) }
          : version
      );
      return updatedVersions;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleAddElement = async () => {
    if (currentVersionId === null) return;

    try {
      const response = await axios.post('/api/claude', { prompt: inputValue });
      const newElements = response.data.elements; // Adjust based on your API response structure

      setVersions(prevVersions => {
        const updatedVersions = prevVersions.map(version =>
          version.id === currentVersionId
            ? { ...version, reuseableElementList: [...version.reuseableElementList, ...newElements] }
            : version
        );
        return updatedVersions;
      });

      setInputValue(''); // Clear input after adding
    } catch (error) {
      console.error('Error adding reusable element:', error);
    }
  };

  return (
    <div className="reusable-element-toolbar">
      <div className="input-group">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter element description"
        />
        <button onClick={handleAddElement}>Add</button>
      </div>
      {currentVersionId !== null && versions.find(version => version.id === currentVersionId)!.reuseableElementList.map((element, index) => (
        <div
          key={index}
          className="reusable-element-item"
          onMouseEnter={() => setHoveredElement(element.codeText)}
          onMouseLeave={() => setHoveredElement(null)}
        >
          <span>{element.codeName}</span>
          <button className="delete-icon" onClick={() => handleDeleteReusableElement(currentVersionId, element.codeName)}>🗑️</button>
          {hoveredElement === element.codeText && (
            <div className="hovered-element-text">
              <pre>{element.codeText}</pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReusableElementToolbar;
