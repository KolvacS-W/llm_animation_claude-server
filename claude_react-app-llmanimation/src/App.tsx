import React, { useState, useEffect } from 'react';
import DescriptionEditor from './components/DescriptionEditor';
import CustomCodeEditor from './components/CodeEditor';
import ResultViewer from './components/ResultViewer';
import './App.css';
import { KeywordTree, Version } from './types';
import { v4 as uuidv4 } from 'uuid';
import ListGroup from 'react-bootstrap/ListGroup';
import ReusableElementToolbar from './components/ReusableElementToolbar';

const App: React.FC = () => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  useEffect(() => {
    // Initialize the base version on load
    const baseVersion: Version = {
      id: 'init',
      description: "Adding sth...",
      savedOldDescription: '', 
      code: { html: '', css: '', js: `// Initialize Fabric.js canvas
const canvas = new fabric.Canvas('c', {
    backgroundColor: '#DBB4B4'
});

canvas.setHeight(600);
canvas.setWidth(600);

// Example usage
const myObject = new Generate('house');
myObject.detail('small house, with a rgb(180,160,122) roof and blue walls');` },
      savedOldCode: { html: '', css: '', js: '' },
      keywordTree: [
        { level: 1, keywords: [] },
        { level: 2, keywords: [] },
      ],
      wordselected: 'ocean',
      highlightEnabled: false,
      loading: false,
      piecesToHighlightLevel1: [],
      piecesToHighlightLevel2: [],
      showDetails: {},
      latestDescriptionText: '', 
      hiddenInfo: [],
      formatDescriptionHtml:'',
      specificParamList: [], // Added
      paramCheckEnabled: false, // Added
      reuseableElementList: [], // Added
    };
  
    setVersions([baseVersion]);
    setCurrentVersionId(baseVersion.id);
  }, []);
  

  const stopwords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 
    'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 
    'this', 'to', 'was', 'will', 'with'
  ]);

  const extractKeywords = (description: string) => {
    const regex = /\[(.*?)\]\{(.*?)\}/g;
    const level1Keywords = new Set<string>();
    const allSubKeywords = new Set<string>();
  
    let match;
    while ((match = regex.exec(description)) !== null) {
      // Split the keyword parts into individual words
      const keywordParts = match[1].trim().split(/\s+/).map(word => unpluralize(uncapitalize(word)));
      // Add each word as a separate keyword
      keywordParts.forEach(keyword => level1Keywords.add(keyword));
  
      const details = match[2].trim();
      const subKeywords = details
        .split(/[\s,()]+/)
        .map(word => unpluralize(uncapitalize(word.trim())))
        .filter(word => word && !stopwords.has(word));
  
      subKeywords.forEach(subKeyword => allSubKeywords.add(subKeyword));
    }
  
    const newKeywordTree: KeywordTree[] = [
      { level: 1, keywords: [] },
      { level: 2, keywords: [] },
    ];
  
    level1Keywords.forEach(keyword => {
      newKeywordTree[0].keywords.push({
        keyword,
        subKeywords: [],
        children: [],
        codeBlock: '',
        parentKeyword: null
      });
    });
  
    const uniqueSubKeywords = Array.from(allSubKeywords).filter(
      subKeyword => !level1Keywords.has(subKeyword)
    );
  
    uniqueSubKeywords.forEach(subKeyword => {
      newKeywordTree[1].keywords.push({
        keyword: subKeyword,
        subKeywords: [],
        children: [],
        codeBlock: '',
        parentKeyword: null
      });
    });
  
    console.log('keyword tree updated', currentVersionId, newKeywordTree);
    return newKeywordTree;
  };
  
  // const extractKeywords = (description: string) => {
  //   const regex = /\[(.*?)\]\{(.*?)\}/g;
  //   const level1Keywords = new Set<string>();
  //   const allSubKeywords = new Set<string>();
  
  //   let match;
  //   while ((match = regex.exec(description)) !== null) {
  //     const keywordParts = match[1].trim().split(/\s+/).map(word => unpluralize(uncapitalize(word)));
  //     keywordParts.forEach(keyword => level1Keywords.add(keyword));
  
  //     const details = match[2].trim();
  //     const subKeywords = details
  //       .split(/[\s,()]+/)
  //       .map(word => unpluralize(uncapitalize(word.trim())))
  //       .filter(word => word && !stopwords.has(word));
  
  //     subKeywords.forEach(subKeyword => allSubKeywords.add(subKeyword));
  //   }
  
  //   const newKeywordTree: KeywordTree[] = [
  //     { level: 1, keywords: [] },
  //     { level: 2, keywords: [] },
  //   ];
  
  //   level1Keywords.forEach(keyword => {
  //     newKeywordTree[0].keywords.push({
  //       keyword,
  //       subKeywords: [],
  //       children: [],
  //       codeBlock: '',
  //       parentKeyword: null
  //     });
  //   });
  
  //   const uniqueSubKeywords = Array.from(allSubKeywords).filter(
  //     subKeyword => !level1Keywords.has(subKeyword)
  //   );
  
  //   uniqueSubKeywords.forEach(subKeyword => {
  //     newKeywordTree[1].keywords.push({
  //       keyword: subKeyword,
  //       subKeywords: [],
  //       children: [],
  //       codeBlock: '',
  //       parentKeyword: null
  //     });
  //   });
  
  //   console.log('keyword tree updated', currentVersionId, newKeywordTree);
  //   return newKeywordTree;
  // };
  
  // Dummy implementations of uncapitalize and unpluralize for demonstration purposes
  function uncapitalize(word: string): string {
    return word.charAt(0).toLowerCase() + word.slice(1);
  }
  
  function unpluralize(word: string): string {
    return word.endsWith('s') ? word.slice(0, -1) : word;
  }
  
  

  const handleDescriptionApply = (newDescription: string) => {
    if (currentVersionId === null) return;
    setVersions((prevVersions) => {
      const updatedVersions = prevVersions.map(version =>
        version.id === currentVersionId
          ? { ...version, description: newDescription, keywordTree: extractKeywords(newDescription) }
          : version
      );
      return updatedVersions;
    });
  };

  const handleCodeInitialize = (newCode: { html: string; css: string; js: string }) => {
    console.log('check code in handleCodeInitialize', newCode.html)
    if (currentVersionId === null) return;
    setVersions((prevVersions) => {
      const updatedVersions = prevVersions.map(version =>
        version.id === currentVersionId
          ? { ...version, code: newCode }
          : version
      );
      return updatedVersions;
    });
  };


  const handleWordSelected = (word: string) => {
    console.log('selected word', word)
    if (currentVersionId === null) return;
    setVersions((prevVersions) => {
      const updatedVersions = prevVersions.map(version =>
        version.id === currentVersionId
          ? { ...version, wordselected: word }
          : version
      );
      return updatedVersions;
    });
  };

  //version controls
  const saveCurrentVersion = () => {
    const currentVersion = versions.find(version => version.id === currentVersionId);
    if (!currentVersion) return;
  
    if (currentVersion.id.includes('init')) {
      const versionName = prompt("Enter version name:");
      if (!versionName) return;
  
      // Change version id first
      setVersions(prevVersions => {
        const updatedVersions = prevVersions.map(version =>
          version.id === currentVersionId
            ? { ...version, id: versionName }
            : version
        );
        return updatedVersions;
      });
  
      // Update currentVersionId
      setCurrentVersionId(versionName);
  
      // Update version contents
      setVersions(prevVersions => {
        const updatedVersions = prevVersions.map(version =>
          version.id === versionName
            ? {
                ...version,
                description: currentVersion.description,
                savedOldDescription: currentVersion.savedOldDescription,
                code: currentVersion.code,
                savedOldCode: currentVersion.savedOldCode,
                keywordTree: currentVersion.keywordTree,
                wordselected: currentVersion.wordselected,
                highlightEnabled: currentVersion.highlightEnabled,
                loading: currentVersion.loading,
                piecesToHighlightLevel1: currentVersion.piecesToHighlightLevel1,
                piecesToHighlightLevel2: currentVersion.piecesToHighlightLevel2,
              }
            : version
        );
        return updatedVersions;
      });
    } else {
      setVersions(prevVersions => {
        const updatedVersions = prevVersions.map(version =>
          version.id === currentVersionId
            ? {
                ...version,
                description: currentVersion.description,
                savedOldDescription: currentVersion.savedOldDescription,
                code: currentVersion.code,
                savedOldCode: currentVersion.savedOldCode,
                keywordTree: currentVersion.keywordTree,
                wordselected: currentVersion.wordselected,
                highlightEnabled: currentVersion.highlightEnabled,
                loading: currentVersion.loading,
                piecesToHighlightLevel1: currentVersion.piecesToHighlightLevel1,
                piecesToHighlightLevel2: currentVersion.piecesToHighlightLevel2,
              }
            : version
        );
        return updatedVersions;
      });
    }
  
    console.log('check all versions', versions);
  };
  

  const createNewVersion = () => {
    const newVersion: Version = {
      id: 'init'+uuidv4(),
      description: "Adding sth...",
      savedOldDescription: '',
      code: { html: '', css: '', js: '' },
      savedOldCode: { html: '', css: '', js: '' },
      keywordTree: [
        { level: 1, keywords: [] },
        { level: 2, keywords: [] },
      ],
      wordselected: 'ocean',
      highlightEnabled: false,
      loading: false,
      piecesToHighlightLevel1: [],
      piecesToHighlightLevel2: [],
      showDetails: {},
      latestDescriptionText: '',
      hiddenInfo: [],
      formatDescriptionHtml:'',
      specificParamList: [], // Added
      paramCheckEnabled: false, // Added
      reuseableElementList: [], // Added
    };

    setVersions([...versions, newVersion]);
    setCurrentVersionId(newVersion.id);
  };

  const generateUniqueId = (baseId: string) => {
    let newId = baseId;
    let counter = 1;
    while (versions.some(version => version.id === newId)) {
      newId = `${baseId}${counter}`;
      counter += 1;
    }
    return newId;
  };
  
  const copyCurrentVersion = () => {
    const currentVersion = versions.find(version => version.id === currentVersionId);
    if (!currentVersion) return;

    const baseId = `${currentVersion.id}-copy`;
    const newId = generateUniqueId(baseId);

    const newVersion: Version = {
      ...currentVersion,
      id: newId,
    };

    setVersions([...versions, newVersion]);
    setCurrentVersionId(newVersion.id);
  };


  const switchToVersion = (id: string) => {
    console.log('check all versions', versions);
    const selectedVersion = versions.find(version => version.id === id);
    if (selectedVersion) {
      console.log('selected version', selectedVersion);
      setCurrentVersionId(id);
    }
  };

  const deleteVersion = (id: string) => {
    setVersions((prevVersions) => prevVersions.filter(version => version.id !== id));
    setCurrentVersionId(null);
    // createNewVersion();
  };

  const createTestVersion = () => {
    const currentVersion = versions.find(version => version.id === currentVersionId);
    if (!currentVersion) return;
  
    const newId = `${currentVersion.id}-test`;
    const prefix = 'In the description, words in [] are important entities, and following entities are detailed hints in {} to specify how to create these entities and animations.\n '
    const newVersion: Version = {
      id: newId,
      description: prefix +currentVersion.description,
      savedOldDescription: '', 
      code: { html: '', css: '', js: '' },
      savedOldCode: { html: '', css: '', js: '' },
      keywordTree: [
        { level: 1, keywords: [] },
        { level: 2, keywords: [] },
      ],
      wordselected: 'ocean',
      highlightEnabled: false,
      loading: false,
      piecesToHighlightLevel1: [],
      piecesToHighlightLevel2: [],
      showDetails: {},
      latestDescriptionText: '', 
      hiddenInfo: [],
      formatDescriptionHtml:'',
      specificParamList: [], // Added
      paramCheckEnabled: false, // Added
      reuseableElementList: currentVersion.reuseableElementList, // Added
    };
  
    setVersions([...versions, newVersion]);
    setCurrentVersionId(newVersion.id);
  };
  
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

  return (
    <div className="App">
      <div className="editor-section">
        {currentVersionId !== null && versions.find(version => version.id === currentVersionId) && (
          <>
            <DescriptionEditor
              onApply={handleDescriptionApply}
              savedOldCode={versions.find(version => version.id === currentVersionId)!.savedOldCode}
              onWordSelected={handleWordSelected}
              currentVersionId={currentVersionId}
              versions={versions}
              setVersions={setVersions}
              extractKeywords={extractKeywords}
            />
            <CustomCodeEditor
              code={versions.find(version => version.id === currentVersionId)!.code}
              onApply={handleCodeInitialize}
              description={versions.find(version => version.id === currentVersionId)!.description}
              savedOldCode={versions.find(version => version.id === currentVersionId)!.savedOldCode}
              keywordTree={versions.find(version => version.id === currentVersionId)!.keywordTree}
              wordselected={versions.find(version => version.id === currentVersionId)!.wordselected}
              currentVersionId={currentVersionId}
              versions={versions}
              setVersions={setVersions}
              extractKeywords={extractKeywords}
            />
            <ResultViewer code={versions.find(version => version.id === currentVersionId)!.code} />
            <ReusableElementToolbar
              currentVersionId={currentVersionId}
              versions={versions}
              setVersions={setVersions}
              hoveredElement={hoveredElement}
              setHoveredElement={setHoveredElement}
            />
          </>
        )}
      </div>
      <div className="version-controls">
        <button className="test-button" onClick={createTestVersion}>Test</button>
        <button className="purple-button" onClick={saveCurrentVersion}>Save</button>
        <button className="green-button" onClick={createNewVersion}>New</button>
        <button className="green-button" onClick={copyCurrentVersion}>Copy</button>
        {currentVersionId !== null && (
          <button className="delete-button" onClick={() => deleteVersion(currentVersionId)}>Delete</button>
        )}
        <div className="version-buttons">
          {versions.map((version) => (
            <button
              key={version.id}
              className={`version-button ${currentVersionId === version.id ? 'selected' : ''}`}
              onClick={() => switchToVersion(version.id)}
            >
              {version.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
  
export default App;


