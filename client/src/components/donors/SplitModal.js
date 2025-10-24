import React, { useState } from 'react';
import { useDonors } from '../../contexts/DonorContext';
import { useNavigate } from 'react-router-dom';

const SplitModal = ({ onClose, pendingSheep, pendingCowShares, cowGroups }) => {
    const [agentCount, setAgentCount] = useState(1);
    const [agentNames, setAgentNames] = useState(['Agent 1']);
    const { splitDonors } = useDonors();
    const navigate = useNavigate();

    const handleAgentCountChange = (e) => {
        const count = parseInt(e.target.value, 10);
        if (count > 0) {
            setAgentCount(count);
            // Update agent names array
            const newNames = [];
            for (let i = 0; i < count; i++) {
                newNames[i] = agentNames[i] || `Agent ${i + 1}`;
            }
            setAgentNames(newNames);
        }
    };

    const handleAgentNameChange = (index, name) => {
        const newNames = [...agentNames];
        newNames[index] = name;
        setAgentNames(newNames);
    };

    const handleSplit = async () => {
        try {
            const assignments = await splitDonors(agentCount, agentNames);

            onClose();

            // Navigate to the first agent's page
            if (assignments && assignments.length > 0) {
                navigate(`/agent/${assignments[0].id}`);
            }
        } catch (error) {
            console.error('Error splitting donors:', error);
            // Add error handling UI if needed
        }
    };

    // Calculate donors per agent
    const donorsPerAgent = agentCount > 0 ? Math.ceil(pendingSheep / agentCount) : 0;
    const cowGroupsPerAgent = agentCount > 0 ? Math.floor(cowGroups / agentCount) : 0;
    const remainingCowGroups = agentCount > 0 ? cowGroups % agentCount : 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
                <h2 className="text-2xl font-bold mb-4">Split Donors Between Agents</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-700 font-medium">Pending Sheep</p>
                        <p className="text-2xl font-bold">{pendingSheep}</p>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-green-700 font-medium">Complete Cow Groups</p>
                        <p className="text-2xl font-bold">{cowGroups} <span className="text-sm">({pendingCowShares} shares)</span></p>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Agents
                    </label>
                    <input
                        type="number"
                        value={agentCount}
                        onChange={handleAgentCountChange}
                        min="1"
                        className="form-input"
                    />
                </div>

                {agentCount > 0 && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Agent Names
                        </label>

                        <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
                            {[...Array(agentCount)].map((_, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    value={agentNames[index]}
                                    onChange={(e) => handleAgentNameChange(index, e.target.value)}
                                    className="form-input mb-1"
                                    placeholder={`Agent ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="font-medium mb-2">Distribution Preview</h3>

                    <div className="text-sm">
                        <p>Each agent will be assigned approximately:</p>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            <li>
                                <strong>{donorsPerAgent}</strong> sheep sacrifices
                                {agentCount > 0 && pendingSheep % agentCount !== 0 &&
                                    <span className="text-gray-500"> (some may have one less)</span>
                                }
                            </li>
                            <li>
                                <strong>{cowGroupsPerAgent}</strong> complete cow groups
                                {remainingCowGroups > 0 &&
                                    <span className="text-gray-500"> (first {remainingCowGroups} agents will get 1 extra)</span>
                                }
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSplit}
                    >
                        Split and Create Agent Lists
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SplitModal;
