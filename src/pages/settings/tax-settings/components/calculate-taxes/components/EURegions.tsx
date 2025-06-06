/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { TaxSetting } from '$app/common/interfaces/company.interface';
import { Element } from '$app/components/cards';
import { Button, Checkbox, SelectField } from '$app/components/forms';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { ChangeEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditSubRegionModal } from './EditSubRegionModal';
import Toggle from '$app/components/forms/Toggle';

export function EURegions() {
  const [t] = useTranslation();
  const handleChange = useHandleCurrentCompanyChangeProperty();
  const companyChanges = useCompanyChanges();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditSubregionModalOpen, setIsEditSubregionModalOpen] =
    useState<boolean>(false);

  const regions: Array<[string, TaxSetting]> = Object.entries(
    companyChanges.tax_data.regions.EU.subregions
  );
  const [taxSetting, setTaxSetting] = useState<TaxSetting>(regions[0][1]);
  const [subRegion, setSubRegion] = useState<string>(regions[0][0]);

  const isChecked = (apply_tax: string | boolean) => {
    return Boolean(apply_tax);
  };

  const countSelected = useMemo(() => {
    return regions.filter(([, taxSetting]) => isChecked(taxSetting.apply_tax))
      .length;
  }, [regions]);

  const handleChangeAndUpdateView = (value: string, checked: boolean) => {
    handleChange(value, checked);
    setIsOpen(!checked);
  };

  const divClickIntercept = (id: string) => {
    console.log(id);

    const checkbox = document.getElementById(id.replace('.apply_tax', ''));
    checkbox?.click();
  };

  return (
    <>
      <Element leftSide="Europe" key="EU">
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-4">
            <SelectField
              id="tax_data.regions.EU.tax_all_subregions"
              className=""
              value={companyChanges.tax_data.regions.EU.tax_all_subregions}
              onValueChange={(value) =>
                handleChangeAndUpdateView(
                  'tax_data.regions.EU.tax_all_subregions',
                  value === 'true'
                )
              }
            >
              <option value="true">{t('tax_all')}</option>
              <option value="false">
                {t('tax_selected')} - [ {countSelected} {t('selected')} ]
              </option>
            </SelectField>
          </div>

          {!companyChanges.tax_data.regions.EU.tax_all_subregions && (
            <div className="flex col-span-1 col-start-5 col-end-6 justify-end">
              <Button
                type="primary"
                className=""
                onClick={(e: ChangeEvent<HTMLInputElement>) => {
                  e.preventDefault();
                  setIsOpen((isOpen) => !isOpen);
                }}
              >
                {isOpen ? t('hide') : t('show')}
              </Button>
            </div>
          )}
        </div>
      </Element>
      {isOpen &&
        regions?.map((value: [string, TaxSetting], index) => (
          <div
            key={index}
            className="border py-4 sm:py-3 sm:grid sm:grid-cols-3 sm:gap-10 flex flex-col lg:flex-row undefined px-5 sm:px-6 lg:items-center text-sm"
          >
            <div
              className="flex col-span-1 items-center justify-start pl-5"
              onClick={(e) => {
                if (e.target instanceof HTMLInputElement) {
                  return;
                }

                divClickIntercept(
                  `tax_data.regions.EU.subregions.${value[0]}.apply_tax`
                );
              }}
            >
              <Checkbox
                id={`tax_data.regions.EU.subregions.${value[0]}`}
                value={`tax_data.regions.EU.subregions.${value[0]}.apply_tax`}
                checked={value[1].apply_tax ? true : false}
                className="flex justify-end h-6 w-6 rounded-half shadow"
                disabled={companyChanges.tax_data.regions.EU.tax_all_subregions}
                onValueChange={(value, checked) => handleChange(value, checked)}
              ></Checkbox>

              <div className="">{value[0]}</div>
            </div>

            <div
              onClick={() =>
                divClickIntercept(
                  `tax_data.regions.EU.subregions.${value[0]}.apply_tax`
                )
              }
            >
              {value[1].tax_name} {value[1].tax_rate}%{' '}
              {value[1].reduced_tax_rate
                ? ` :: ${t('reduced_rate')} ${value[1].reduced_tax_rate}%`
                : ''}
            </div>

            <div className="flex justify-end">
              <Button
                type="primary"
                className=""
                disableWithoutIcon={true}
                disabled={companyChanges.tax_data.regions.EU.tax_all_subregions}
                onClick={(e: ChangeEvent<HTMLInputElement>) => {
                  e.preventDefault();
                  setTaxSetting(value[1]);
                  setSubRegion(value[0]);
                  setIsEditSubregionModalOpen(true);
                }}
              >
                {t('edit')}
              </Button>
            </div>
          </div>
        ))}

      <EditSubRegionModal
        visible={isEditSubregionModalOpen}
        setVisible={setIsEditSubregionModalOpen}
        region="EU"
        subregion={subRegion}
        taxSetting={taxSetting}
      />

      <Element
        leftSide={<p className="lg:pl-5">(EU) {t('sales_above_threshold')}</p>}
      >
        <Toggle
          id="tax_data.regions.EU.has_sales_above_threshold"
          checked={
            companyChanges?.tax_data?.regions?.EU?.has_sales_above_threshold
          }
          onValueChange={(v) =>
            handleChange('tax_data.regions.EU.has_sales_above_threshold', v)
          }
        />
      </Element>
    </>
  );
}
