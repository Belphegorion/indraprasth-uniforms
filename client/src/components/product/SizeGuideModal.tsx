import React from 'react';
import { Modal } from '../ui/Modal';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  productType?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tailoring Measurement & Size Guide" maxWidth="max-w-2xl">
      <div className="space-y-6 text-sm text-ink font-sans">
        <p className="text-xs text-slate font-serif italic">
          All measurements are calibrated in inches. For growing students, our master tailors recommend selecting one size up to ensure ease of movement throughout the academic year.
        </p>

        {/* Shirts & Blazers Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-navy-800 text-sm">
              Shirts, Blazers & Sweaters
            </h4>
            <span className="text-[11px] font-mono font-bold text-navy-800 bg-blue-100 px-2 py-0.5 rounded-[4px] border border-blue-600/30">
              Chest Standard Guide
            </span>
          </div>
          <div className="overflow-x-auto border border-sand-300 rounded-[10px] bg-cream-50">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-sand-200 border-b border-sand-300 font-serif font-bold text-navy-800">
                <tr>
                  <th className="p-2.5">Size Tag</th>
                  <th className="p-2.5">Typical Age</th>
                  <th className="p-2.5">Chest (Inches)</th>
                  <th className="p-2.5">Shoulder</th>
                  <th className="p-2.5">Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-300 font-sans text-ink">
                <tr className="hover:bg-sand-200/40">
                  <td className="p-2.5 font-mono font-bold text-navy-800">26</td>
                  <td className="p-2.5 text-slate">4 - 5 Yrs</td>
                  <td className="p-2.5 font-mono">26" - 27"</td>
                  <td className="p-2.5 font-mono">11.5"</td>
                  <td className="p-2.5 font-mono">18"</td>
                </tr>
                <tr className="hover:bg-sand-200/40 bg-sand-200/20">
                  <td className="p-2.5 font-mono font-bold text-navy-800">28</td>
                  <td className="p-2.5 text-slate">6 - 7 Yrs</td>
                  <td className="p-2.5 font-mono">28" - 29"</td>
                  <td className="p-2.5 font-mono">12.5"</td>
                  <td className="p-2.5 font-mono">20"</td>
                </tr>
                <tr className="hover:bg-sand-200/40">
                  <td className="p-2.5 font-mono font-bold text-navy-800">30</td>
                  <td className="p-2.5 text-slate">8 - 9 Yrs</td>
                  <td className="p-2.5 font-mono">30" - 31"</td>
                  <td className="p-2.5 font-mono">13.5"</td>
                  <td className="p-2.5 font-mono">22"</td>
                </tr>
                <tr className="hover:bg-sand-200/40 bg-sand-200/20">
                  <td className="p-2.5 font-mono font-bold text-navy-800">32</td>
                  <td className="p-2.5 text-slate">10 - 11 Yrs</td>
                  <td className="p-2.5 font-mono">32" - 33"</td>
                  <td className="p-2.5 font-mono">14.5"</td>
                  <td className="p-2.5 font-mono">24"</td>
                </tr>
                <tr className="hover:bg-sand-200/40">
                  <td className="p-2.5 font-mono font-bold text-navy-800">34</td>
                  <td className="p-2.5 text-slate">12 - 13 Yrs</td>
                  <td className="p-2.5 font-mono">34" - 35"</td>
                  <td className="p-2.5 font-mono">15.5"</td>
                  <td className="p-2.5 font-mono">26"</td>
                </tr>
                <tr className="hover:bg-sand-200/40 bg-sand-200/20">
                  <td className="p-2.5 font-mono font-bold text-navy-800">36</td>
                  <td className="p-2.5 text-slate">14 - 15 Yrs</td>
                  <td className="p-2.5 font-mono">36" - 37"</td>
                  <td className="p-2.5 font-mono">16.5"</td>
                  <td className="p-2.5 font-mono">28"</td>
                </tr>
                <tr className="hover:bg-sand-200/40">
                  <td className="p-2.5 font-mono font-bold text-navy-800">38+</td>
                  <td className="p-2.5 text-slate">Senior Student</td>
                  <td className="p-2.5 font-mono">38" - 40"</td>
                  <td className="p-2.5 font-mono">17.5"</td>
                  <td className="p-2.5 font-mono">29"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Trousers & Dividers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-navy-800 text-sm">
              Trousers, Dividers & Skirts
            </h4>
            <span className="text-[11px] font-mono font-bold text-navy-800 bg-blue-100 px-2 py-0.5 rounded-[4px] border border-blue-600/30">
              Waist Standard Guide
            </span>
          </div>
          <div className="overflow-x-auto border border-sand-300 rounded-[10px] bg-cream-50">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-sand-200 border-b border-sand-300 font-serif font-bold text-navy-800">
                <tr>
                  <th className="p-2.5">Size Tag</th>
                  <th className="p-2.5">Waist (Inches)</th>
                  <th className="p-2.5">Hip</th>
                  <th className="p-2.5">Trouser Outseam Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-300 font-sans text-ink">
                <tr className="hover:bg-sand-200/40">
                  <td className="p-2.5 font-mono font-bold text-navy-800">24</td>
                  <td className="p-2.5 font-mono">22" - 24"</td>
                  <td className="p-2.5 font-mono">28"</td>
                  <td className="p-2.5 font-mono">28"</td>
                </tr>
                <tr className="hover:bg-sand-200/40 bg-sand-200/20">
                  <td className="p-2.5 font-mono font-bold text-navy-800">26</td>
                  <td className="p-2.5 font-mono">24" - 26"</td>
                  <td className="p-2.5 font-mono">30"</td>
                  <td className="p-2.5 font-mono">31"</td>
                </tr>
                <tr className="hover:bg-sand-200/40">
                  <td className="p-2.5 font-mono font-bold text-navy-800">28</td>
                  <td className="p-2.5 font-mono">26" - 28"</td>
                  <td className="p-2.5 font-mono">32"</td>
                  <td className="p-2.5 font-mono">34"</td>
                </tr>
                <tr className="hover:bg-sand-200/40 bg-sand-200/20">
                  <td className="p-2.5 font-mono font-bold text-navy-800">30</td>
                  <td className="p-2.5 font-mono">28" - 30"</td>
                  <td className="p-2.5 font-mono">34"</td>
                  <td className="p-2.5 font-mono">37"</td>
                </tr>
                <tr className="hover:bg-sand-200/40">
                  <td className="p-2.5 font-mono font-bold text-navy-800">32</td>
                  <td className="p-2.5 font-mono">30" - 32"</td>
                  <td className="p-2.5 font-mono">36"</td>
                  <td className="p-2.5 font-mono">39"</td>
                </tr>
                <tr className="hover:bg-sand-200/40 bg-sand-200/20">
                  <td className="p-2.5 font-mono font-bold text-navy-800">34+</td>
                  <td className="p-2.5 font-mono">32" - 34"</td>
                  <td className="p-2.5 font-mono">38"</td>
                  <td className="p-2.5 font-mono">41"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 bg-sand-200/60 rounded-[10px] border border-sand-300 text-xs text-ink space-y-1">
          <p className="font-serif font-bold text-navy-800">Complimentary Alteration Service</p>
          <p className="font-sans text-slate">
            Unsure of the exact size? Visit any of our 4 Bhopal branches (Jawahar Chowk, Kolar Road, Piplani, Karond) for in-person student trial rooms and free alteration adjustments.
          </p>
        </div>
      </div>
    </Modal>
  );
};
