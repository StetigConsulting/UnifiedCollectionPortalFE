import React from 'react';
import { Button } from '@/components/ui/button';

export interface Agent {
  id: number;
  name: string;
  phone: string;
}

interface DualListTransferProps {
  leftTitle: string;
  rightTitle: string;
  leftList: Agent[];
  rightList: Agent[];
  selectedLeft: number[];
  selectedRight: number[];
  onSelectLeft: (id: number) => void;
  onSelectRight: (id: number) => void;
  moveRight: () => void;
  moveAllRight: () => void;
  moveLeft: () => void;
  moveAllLeft: () => void;
}

export const DualListTransfer: React.FC<DualListTransferProps> = ({
  leftTitle, rightTitle, leftList, rightList,
  selectedLeft, selectedRight, onSelectLeft, onSelectRight,
  moveRight, moveAllRight, moveLeft, moveAllLeft
}) => (
  <div className="flex gap-8 items-start bg-white p-6 rounded shadow">
    {/* Left List */}
    <div className="flex-1">
      <div className="font-medium mb-2">{leftTitle}</div>
      <div className="border rounded h-96 overflow-y-auto bg-gray-100">
        {leftList.map(agent => (
          <div
            key={agent.id}
            className={`px-3 py-2 cursor-pointer ${selectedLeft.includes(agent.id) ? 'bg-blue-200' : ''}`}
            onClick={() => onSelectLeft(agent.id)}
          >
            {agent.name} - {agent.phone}
          </div>
        ))}
        {leftList.length === 0 && <div className="text-center text-gray-400 py-8">No agents</div>}
      </div>
    </div>
    {/* Arrows */}
    <div className="flex flex-col items-center justify-center gap-2 mt-16">
      <Button type="button" variant="outline" onClick={moveRight} disabled={selectedLeft.length === 0}>{'>'}</Button>
      <Button type="button" variant="outline" onClick={moveAllRight} disabled={leftList.length === 0}>{'>>'}</Button>
      <Button type="button" variant="outline" onClick={moveLeft} disabled={selectedRight.length === 0}>{'<'}</Button>
      <Button type="button" variant="outline" onClick={moveAllLeft} disabled={rightList.length === 0}>{'<<'}</Button>
    </div>
    {/* Right List */}
    <div className="flex-1">
      <div className="font-medium mb-2">{rightTitle}</div>
      <div className="border rounded h-96 overflow-y-auto bg-gray-100">
        {rightList.map(agent => (
          <div
            key={agent.id}
            className={`px-3 py-2 cursor-pointer ${selectedRight.includes(agent.id) ? 'bg-blue-200' : ''}`}
            onClick={() => onSelectRight(agent.id)}
          >
            {agent.name} - {agent.phone}
          </div>
        ))}
        {rightList.length === 0 && <div className="text-center text-gray-400 py-8">No agents</div>}
      </div>
    </div>
  </div>
); 