/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import colors from '$app/common/constants/colors';
import { Design } from '$app/common/interfaces/design';
import { useDesignsQuery, useTemplateQuery } from '$app/common/queries/designs';
import { Divider } from '$app/components/cards/Divider';
import { ColorPicker } from '$app/components/forms/ColorPicker';
import { useAtom, useAtomValue } from 'jotai';
import { range } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updatingRecordsAtom as updatingRecordsAtom } from '../../../common/atoms';
import { Card, Element } from '$app/components/cards';
import { Radio, SelectField } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { useHandleSettingsValueChange } from '$app/pages/settings/invoice-design/common/hooks';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { Company } from '$app/common/interfaces/company.interface';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { companySettingsErrorsAtom } from '$app/pages/settings/common/atoms';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { SettingsLabel } from '$app/components/SettingsLabel';
import classNames from 'classnames';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import { AdvancedSettingsPlanAlert } from '$app/components/AdvancedSettingsPlanAlert';

const fonts = [
  { value: 'ABeeZee', label: 'ABeeZee' },
  { value: 'Abel', label: 'Abel' },
  { value: 'Abril_Fatface', label: 'Abril Fatface' },
  { value: 'Aclonica', label: 'Aclonica' },
  { value: 'Acme', label: 'Acme' },
  { value: 'Actor', label: 'Actor' },
  { value: 'Adamina', label: 'Adamina' },
  { value: 'Advent_Pro', label: 'Advent Pro' },
  { value: 'Aguafina_Script', label: 'Aguafina Script' },
  { value: 'Akronim', label: 'Akronim' },
  { value: 'Aladin', label: 'Aladin' },
  { value: 'Aldrich', label: 'Aldrich' },
  { value: 'Alef', label: 'Alef' },
  { value: 'Alegreya', label: 'Alegreya' },
  { value: 'Alegreya_SC', label: 'Alegreya SC' },
  { value: 'Alegreya_Sans', label: 'Alegreya Sans' },
  { value: 'Alegreya_Sans_SC', label: 'Alegreya Sans SC' },
  { value: 'Alex_Brush', label: 'Alex Brush' },
  { value: 'Alfa_Slab_One', label: 'Alfa Slab One' },
  { value: 'Alice', label: 'Alice' },
  { value: 'Alike', label: 'Alike' },
  { value: 'Alike_Angular', label: 'Alike Angular' },
  { value: 'Allan', label: 'Allan' },
  { value: 'Allerta', label: 'Allerta' },
  { value: 'Allerta_Stencil', label: 'Allerta Stencil' },
  { value: 'Allura', label: 'Allura' },
  { value: 'Almendra', label: 'Almendra' },
  { value: 'Almendra_Display', label: 'Almendra Display' },
  { value: 'Almendra_SC', label: 'Almendra SC' },
  { value: 'Amarante', label: 'Amarante' },
  { value: 'Amaranth', label: 'Amaranth' },
  { value: 'Amatic_SC', label: 'Amatic SC' },
  { value: 'Amethysta', label: 'Amethysta' },
  { value: 'Amiri', label: 'Amiri' },
  { value: 'Amita', label: 'Amita' },
  { value: 'Anaheim', label: 'Anaheim' },
  { value: 'Andada', label: 'Andada' },
  { value: 'Andika', label: 'Andika' },
  { value: 'Angkor', label: 'Angkor' },
  { value: 'Annie_Use_Your_Telescope', label: 'Annie Use Your Telescope' },
  { value: 'Anonymous_Pro', label: 'Anonymous Pro' },
  { value: 'Antic', label: 'Antic' },
  { value: 'Antic_Didone', label: 'Antic Didone' },
  { value: 'Antic_Slab', label: 'Antic Slab' },
  { value: 'Anton', label: 'Anton' },
  { value: 'Arapey', label: 'Arapey' },
  { value: 'Arbutus', label: 'Arbutus' },
  { value: 'Arbutus_Slab', label: 'Arbutus Slab' },
  { value: 'Architects_Daughter', label: 'Architects Daughter' },
  { value: 'Archivo_Black', label: 'Archivo Black' },
  { value: 'Archivo_Narrow', label: 'Archivo Narrow' },
  { value: 'Arimo', label: 'Arimo' },
  { value: 'Arizonia', label: 'Arizonia' },
  { value: 'Armata', label: 'Armata' },
  { value: 'Artifika', label: 'Artifika' },
  { value: 'Arvo', label: 'Arvo' },
  { value: 'Arya', label: 'Arya' },
  { value: 'Asap', label: 'Asap' },
  { value: 'Asar', label: 'Asar' },
  { value: 'Asset', label: 'Asset' },
  { value: 'Astloch', label: 'Astloch' },
  { value: 'Asul', label: 'Asul' },
  { value: 'Atomic_Age', label: 'Atomic Age' },
  { value: 'Aubrey', label: 'Aubrey' },
  { value: 'Audiowide', label: 'Audiowide' },
  { value: 'Autour_One', label: 'Autour One' },
  { value: 'Average', label: 'Average' },
  { value: 'Average_Sans', label: 'Average Sans' },
  { value: 'Averia_Gruesa_Libre', label: 'Averia Gruesa Libre' },
  { value: 'Averia_Libre', label: 'Averia Libre' },
  { value: 'Averia_Sans_Libre', label: 'Averia Sans Libre' },
  { value: 'Averia_Serif_Libre', label: 'Averia Serif Libre' },
  { value: 'Bad_Script', label: 'Bad Script' },
  { value: 'Balthazar', label: 'Balthazar' },
  { value: 'Bangers', label: 'Bangers' },
  { value: 'Basic', label: 'Basic' },
  { value: 'Battambang', label: 'Battambang' },
  { value: 'Baumans', label: 'Baumans' },
  { value: 'Bayon', label: 'Bayon' },
  { value: 'Belgrano', label: 'Belgrano' },
  { value: 'Belleza', label: 'Belleza' },
  { value: 'BenchNine', label: 'BenchNine' },
  { value: 'Bentham', label: 'Bentham' },
  { value: 'Berkshire_Swash', label: 'Berkshire Swash' },
  { value: 'Bevan', label: 'Bevan' },
  { value: 'Bigelow_Rules', label: 'Bigelow Rules' },
  { value: 'Bigshot_One', label: 'Bigshot One' },
  { value: 'Bilbo', label: 'Bilbo' },
  { value: 'Bilbo_Swash_Caps', label: 'Bilbo Swash Caps' },
  { value: 'Biryani', label: 'Biryani' },
  { value: 'Bitter', label: 'Bitter' },
  { value: 'Black_Ops_One', label: 'Black Ops One' },
  { value: 'Bokor', label: 'Bokor' },
  { value: 'Bonbon', label: 'Bonbon' },
  { value: 'Boogaloo', label: 'Boogaloo' },
  { value: 'Bowlby_One', label: 'Bowlby One' },
  { value: 'Bowlby_One_SC', label: 'Bowlby One SC' },
  { value: 'Brawler', label: 'Brawler' },
  { value: 'Bree_Serif', label: 'Bree Serif' },
  { value: 'Bubblegum_Sans', label: 'Bubblegum Sans' },
  { value: 'Bubbler_One', label: 'Bubbler One' },
  { value: 'Buda', label: 'Buda' },
  { value: 'Buenard', label: 'Buenard' },
  { value: 'Butcherman', label: 'Butcherman' },
  { value: 'Butterfly_Kids', label: 'Butterfly Kids' },
  { value: 'Cabin', label: 'Cabin' },
  { value: 'Cabin_Condensed', label: 'Cabin Condensed' },
  { value: 'Cabin_Sketch', label: 'Cabin Sketch' },
  { value: 'Caesar_Dressing', label: 'Caesar Dressing' },
  { value: 'Cagliostro', label: 'Cagliostro' },
  { value: 'Calligraffitti', label: 'Calligraffitti' },
  { value: 'Cambay', label: 'Cambay' },
  { value: 'Cambo', label: 'Cambo' },
  { value: 'Candal', label: 'Candal' },
  { value: 'Cantarell', label: 'Cantarell' },
  { value: 'Cantata_One', label: 'Cantata One' },
  { value: 'Cantora_One', label: 'Cantora One' },
  { value: 'Capriola', label: 'Capriola' },
  { value: 'Cardo', label: 'Cardo' },
  { value: 'Carme', label: 'Carme' },
  { value: 'Carrois_Gothic', label: 'Carrois Gothic' },
  { value: 'Carrois_Gothic_SC', label: 'Carrois Gothic SC' },
  { value: 'Carter_One', label: 'Carter One' },
  { value: 'Catamaran', label: 'Catamaran' },
  { value: 'Caudex', label: 'Caudex' },
  { value: 'Caveat', label: 'Caveat' },
  { value: 'Caveat_Brush', label: 'Caveat Brush' },
  { value: 'Cedarville_Cursive', label: 'Cedarville Cursive' },
  { value: 'Ceviche_One', label: 'Ceviche One' },
  { value: 'Changa_One', label: 'Changa One' },
  { value: 'Chango', label: 'Chango' },
  { value: 'Chau_Philomene_One', label: 'Chau Philomene One' },
  { value: 'Chela_One', label: 'Chela One' },
  { value: 'Chelsea_Market', label: 'Chelsea Market' },
  { value: 'Chenla', label: 'Chenla' },
  { value: 'Cherry_Cream_Soda', label: 'Cherry Cream Soda' },
  { value: 'Cherry_Swash', label: 'Cherry Swash' },
  { value: 'Chewy', label: 'Chewy' },
  { value: 'Chicle', label: 'Chicle' },
  { value: 'Chivo', label: 'Chivo' },
  { value: 'Chonburi', label: 'Chonburi' },
  { value: 'Cinzel', label: 'Cinzel' },
  { value: 'Cinzel_Decorative', label: 'Cinzel Decorative' },
  { value: 'Clicker_Script', label: 'Clicker Script' },
  { value: 'Coda', label: 'Coda' },
  { value: 'Coda_Caption', label: 'Coda Caption' },
  { value: 'Codystar', label: 'Codystar' },
  { value: 'Combo', label: 'Combo' },
  { value: 'Comfortaa', label: 'Comfortaa' },
  { value: 'Coming_Soon', label: 'Coming Soon' },
  { value: 'Concert_One', label: 'Concert One' },
  { value: 'Condiment', label: 'Condiment' },
  { value: 'Content', label: 'Content' },
  { value: 'Contrail_One', label: 'Contrail One' },
  { value: 'Convergence', label: 'Convergence' },
  { value: 'Cookie', label: 'Cookie' },
  { value: 'Copse', label: 'Copse' },
  { value: 'Corben', label: 'Corben' },
  { value: 'Courgette', label: 'Courgette' },
  { value: 'Cousine', label: 'Cousine' },
  { value: 'Coustard', label: 'Coustard' },
  { value: 'Covered_By_Your_Grace', label: 'Covered By Your Grace' },
  { value: 'Crafty_Girls', label: 'Crafty Girls' },
  { value: 'Creepster', label: 'Creepster' },
  { value: 'Crete_Round', label: 'Crete Round' },
  { value: 'Crimson_Text', label: 'Crimson Text' },
  { value: 'Croissant_One', label: 'Croissant One' },
  { value: 'Crushed', label: 'Crushed' },
  { value: 'Cuprum', label: 'Cuprum' },
  { value: 'Cutive', label: 'Cutive' },
  { value: 'Cutive_Mono', label: 'Cutive Mono' },
  { value: 'Damion', label: 'Damion' },
  { value: 'Dancing_Script', label: 'Dancing Script' },
  { value: 'Dangrek', label: 'Dangrek' },
  { value: 'Dawning_of_a_New_Day', label: 'Dawning of a New Day' },
  { value: 'Days_One', label: 'Days One' },
  { value: 'Dekko', label: 'Dekko' },
  { value: 'Delius', label: 'Delius' },
  { value: 'Delius_Swash_Caps', label: 'Delius Swash Caps' },
  { value: 'Delius_Unicase', label: 'Delius Unicase' },
  { value: 'Della_Respira', label: 'Della Respira' },
  { value: 'Denk_One', label: 'Denk One' },
  { value: 'Devonshire', label: 'Devonshire' },
  { value: 'Dhurjati', label: 'Dhurjati' },
  { value: 'Didact_Gothic', label: 'Didact Gothic' },
  { value: 'Diplomata', label: 'Diplomata' },
  { value: 'Diplomata_SC', label: 'Diplomata SC' },
  { value: 'Domine', label: 'Domine' },
  { value: 'Donegal_One', label: 'Donegal One' },
  { value: 'Doppio_One', label: 'Doppio One' },
  { value: 'Dorsa', label: 'Dorsa' },
  { value: 'Dosis', label: 'Dosis' },
  { value: 'Dr_Sugiyama', label: 'Dr Sugiyama' },
  { value: 'Droid_Sans', label: 'Droid Sans' },
  { value: 'Droid_Sans_Mono', label: 'Droid Sans Mono' },
  { value: 'Droid_Serif', label: 'Droid Serif' },
  { value: 'Duru_Sans', label: 'Duru Sans' },
  { value: 'Dynalight', label: 'Dynalight' },
  { value: 'EB_Garamond', label: 'EB Garamond' },
  { value: 'Eagle_Lake', label: 'Eagle Lake' },
  { value: 'Eater', label: 'Eater' },
  { value: 'Economica', label: 'Economica' },
  { value: 'Eczar', label: 'Eczar' },
  { value: 'Ek_Mukta', label: 'Ek Mukta' },
  { value: 'Electrolize', label: 'Electrolize' },
  { value: 'Elsie', label: 'Elsie' },
  { value: 'Elsie_Swash_Caps', label: 'Elsie Swash Caps' },
  { value: 'Emblema_One', label: 'Emblema One' },
  { value: 'Emilys_Candy', label: 'Emilys Candy' },
  { value: 'Engagement', label: 'Engagement' },
  { value: 'Englebert', label: 'Englebert' },
  { value: 'Enriqueta', label: 'Enriqueta' },
  { value: 'Erica_One', label: 'Erica One' },
  { value: 'Esteban', label: 'Esteban' },
  { value: 'Euphoria_Script', label: 'Euphoria Script' },
  { value: 'Ewert', label: 'Ewert' },
  { value: 'Exo', label: 'Exo' },
  { value: 'Exo_2', label: 'Exo 2' },
  { value: 'Expletus_Sans', label: 'Expletus Sans' },
  { value: 'Fanwood_Text', label: 'Fanwood Text' },
  { value: 'Fascinate', label: 'Fascinate' },
  { value: 'Fascinate_Inline', label: 'Fascinate Inline' },
  { value: 'Faster_One', label: 'Faster One' },
  { value: 'Fasthand', label: 'Fasthand' },
  { value: 'Fauna_One', label: 'Fauna One' },
  { value: 'Federant', label: 'Federant' },
  { value: 'Federo', label: 'Federo' },
  { value: 'Felipa', label: 'Felipa' },
  { value: 'Fenix', label: 'Fenix' },
  { value: 'Finger_Paint', label: 'Finger Paint' },
  { value: 'Fira_Mono', label: 'Fira Mono' },
  { value: 'Fira_Sans', label: 'Fira Sans' },
  { value: 'Fjalla_One', label: 'Fjalla One' },
  { value: 'Fjord_One', label: 'Fjord One' },
  { value: 'Flamenco', label: 'Flamenco' },
  { value: 'Flavors', label: 'Flavors' },
  { value: 'Fondamento', label: 'Fondamento' },
  { value: 'Fontdiner_Swanky', label: 'Fontdiner Swanky' },
  { value: 'Forum', label: 'Forum' },
  { value: 'Francois_One', label: 'Francois One' },
  { value: 'Freckle_Face', label: 'Freckle Face' },
  { value: 'Fredericka_the_Great', label: 'Fredericka the Great' },
  { value: 'Fredoka_One', label: 'Fredoka One' },
  { value: 'Freehand', label: 'Freehand' },
  { value: 'Fresca', label: 'Fresca' },
  { value: 'Frijole', label: 'Frijole' },
  { value: 'Fruktur', label: 'Fruktur' },
  { value: 'Fugaz_One', label: 'Fugaz One' },
  { value: 'GFS_Didot', label: 'GFS Didot' },
  { value: 'GFS_Neohellenic', label: 'GFS Neohellenic' },
  { value: 'Gabriela', label: 'Gabriela' },
  { value: 'Gafata', label: 'Gafata' },
  { value: 'Galdeano', label: 'Galdeano' },
  { value: 'Galindo', label: 'Galindo' },
  { value: 'Gentium_Basic', label: 'Gentium Basic' },
  { value: 'Gentium_Book_Basic', label: 'Gentium Book Basic' },
  { value: 'Geo', label: 'Geo' },
  { value: 'Geostar', label: 'Geostar' },
  { value: 'Geostar_Fill', label: 'Geostar Fill' },
  { value: 'Germania_One', label: 'Germania One' },
  { value: 'Gidugu', label: 'Gidugu' },
  { value: 'Gilda_Display', label: 'Gilda Display' },
  { value: 'Give_You_Glory', label: 'Give You Glory' },
  { value: 'Glass_Antiqua', label: 'Glass Antiqua' },
  { value: 'Glegoo', label: 'Glegoo' },
  { value: 'Gloria_Hallelujah', label: 'Gloria Hallelujah' },
  { value: 'Goblin_One', label: 'Goblin One' },
  { value: 'Gochi_Hand', label: 'Gochi Hand' },
  { value: 'Gorditas', label: 'Gorditas' },
  { value: 'Goudy_Bookletter_1911', label: 'Goudy Bookletter 1911' },
  { value: 'Graduate', label: 'Graduate' },
  { value: 'Grand_Hotel', label: 'Grand Hotel' },
  { value: 'Gravitas_One', label: 'Gravitas One' },
  { value: 'Great_Vibes', label: 'Great Vibes' },
  { value: 'Griffy', label: 'Griffy' },
  { value: 'Gruppo', label: 'Gruppo' },
  { value: 'Gudea', label: 'Gudea' },
  { value: 'Gurajada', label: 'Gurajada' },
  { value: 'Habibi', label: 'Habibi' },
  { value: 'Halant', label: 'Halant' },
  { value: 'Hammersmith_One', label: 'Hammersmith One' },
  { value: 'Hanalei', label: 'Hanalei' },
  { value: 'Hanalei_Fill', label: 'Hanalei Fill' },
  { value: 'Handlee', label: 'Handlee' },
  { value: 'Hanuman', label: 'Hanuman' },
  { value: 'Happy_Monkey', label: 'Happy Monkey' },
  { value: 'Headland_One', label: 'Headland One' },
  { value: 'Henny_Penny', label: 'Henny Penny' },
  { value: 'Herr_Von_Muellerhoff', label: 'Herr Von Muellerhoff' },
  { value: 'Hind', label: 'Hind' },
  { value: 'Hind_Siliguri', label: 'Hind Siliguri' },
  { value: 'Hind_Vadodara', label: 'Hind Vadodara' },
  { value: 'Holtwood_One_SC', label: 'Holtwood One SC' },
  { value: 'Homemade_Apple', label: 'Homemade Apple' },
  { value: 'Homenaje', label: 'Homenaje' },
  { value: 'IM_Fell_DW_Pica', label: 'IM Fell DW Pica' },
  { value: 'IM_Fell_DW_Pica_SC', label: 'IM Fell DW Pica SC' },
  { value: 'IM_Fell_Double_Pica', label: 'IM Fell Double Pica' },
  { value: 'IM_Fell_Double_Pica_SC', label: 'IM Fell Double Pica SC' },
  { value: 'IM_Fell_English', label: 'IM Fell English' },
  { value: 'IM_Fell_English_SC', label: 'IM Fell English SC' },
  { value: 'IM_Fell_French_Canon', label: 'IM Fell French Canon' },
  { value: 'IM_Fell_French_Canon_SC', label: 'IM Fell French Canon SC' },
  { value: 'IM_Fell_Great_Primer', label: 'IM Fell Great Primer' },
  { value: 'IM_Fell_Great_Primer_SC', label: 'IM Fell Great Primer SC' },
  { value: 'Iceberg', label: 'Iceberg' },
  { value: 'Iceland', label: 'Iceland' },
  { value: 'Imprima', label: 'Imprima' },
  { value: 'Inconsolata', label: 'Inconsolata' },
  { value: 'Inder', label: 'Inder' },
  { value: 'Indie_Flower', label: 'Indie Flower' },
  { value: 'Inika', label: 'Inika' },
  { value: 'Inknut_Antiqua', label: 'Inknut Antiqua' },
  { value: 'Irish_Grover', label: 'Irish Grover' },
  { value: 'Istok_Web', label: 'Istok Web' },
  { value: 'Italiana', label: 'Italiana' },
  { value: 'Italianno', label: 'Italianno' },
  { value: 'Itim', label: 'Itim' },
  { value: 'Jacques_Francois', label: 'Jacques Francois' },
  { value: 'Jacques_Francois_Shadow', label: 'Jacques Francois Shadow' },
  { value: 'Jaldi', label: 'Jaldi' },
  { value: 'Jim_Nightshade', label: 'Jim Nightshade' },
  { value: 'Jockey_One', label: 'Jockey One' },
  { value: 'Jolly_Lodger', label: 'Jolly Lodger' },
  { value: 'Josefin_Sans', label: 'Josefin Sans' },
  { value: 'Josefin_Slab', label: 'Josefin Slab' },
  { value: 'Joti_One', label: 'Joti One' },
  { value: 'Judson', label: 'Judson' },
  { value: 'Julee', label: 'Julee' },
  { value: 'Julius_Sans_One', label: 'Julius Sans One' },
  { value: 'Junge', label: 'Junge' },
  { value: 'Jura', label: 'Jura' },
  { value: 'Just_Another_Hand', label: 'Just Another Hand' },
  { value: 'Just_Me_Again_Down_Here', label: 'Just Me Again Down Here' },
  { value: 'Kadwa', label: 'Kadwa' },
  { value: 'Kalam', label: 'Kalam' },
  { value: 'Kameron', label: 'Kameron' },
  { value: 'Kantumruy', label: 'Kantumruy' },
  { value: 'Karla', label: 'Karla' },
  { value: 'Karma', label: 'Karma' },
  { value: 'Kaushan_Script', label: 'Kaushan Script' },
  { value: 'Kavoon', label: 'Kavoon' },
  { value: 'Kdam_Thmor', label: 'Kdam Thmor' },
  { value: 'Keania_One', label: 'Keania One' },
  { value: 'Kelly_Slab', label: 'Kelly Slab' },
  { value: 'Kenia', label: 'Kenia' },
  { value: 'Khand', label: 'Khand' },
  { value: 'Khmer', label: 'Khmer' },
  { value: 'Khula', label: 'Khula' },
  { value: 'Kite_One', label: 'Kite One' },
  { value: 'Knewave', label: 'Knewave' },
  { value: 'Kotta_One', label: 'Kotta One' },
  { value: 'Koulen', label: 'Koulen' },
  { value: 'Kranky', label: 'Kranky' },
  { value: 'Kreon', label: 'Kreon' },
  { value: 'Kristi', label: 'Kristi' },
  { value: 'Krona_One', label: 'Krona One' },
  { value: 'Kurale', label: 'Kurale' },
  { value: 'La_Belle_Aurore', label: 'La Belle Aurore' },
  { value: 'Laila', label: 'Laila' },
  { value: 'Lakki_Reddy', label: 'Lakki Reddy' },
  { value: 'Lancelot', label: 'Lancelot' },
  { value: 'Lateef', label: 'Lateef' },
  { value: 'Lato', label: 'Lato' },
  { value: 'League_Script', label: 'League Script' },
  { value: 'Leckerli_One', label: 'Leckerli One' },
  { value: 'Ledger', label: 'Ledger' },
  { value: 'Lekton', label: 'Lekton' },
  { value: 'Lemon', label: 'Lemon' },
  { value: 'Libre_Baskerville', label: 'Libre Baskerville' },
  { value: 'Life_Savers', label: 'Life Savers' },
  { value: 'Lilita_One', label: 'Lilita One' },
  { value: 'Lily_Script_One', label: 'Lily Script One' },
  { value: 'Limelight', label: 'Limelight' },
  { value: 'Linden_Hill', label: 'Linden Hill' },
  { value: 'Lobster', label: 'Lobster' },
  { value: 'Lobster_Two', label: 'Lobster Two' },
  { value: 'Londrina_Outline', label: 'Londrina Outline' },
  { value: 'Londrina_Shadow', label: 'Londrina Shadow' },
  { value: 'Londrina_Sketch', label: 'Londrina Sketch' },
  { value: 'Londrina_Solid', label: 'Londrina Solid' },
  { value: 'Lora', label: 'Lora' },
  { value: 'Love_Ya_Like_A_Sister', label: 'Love Ya Like A Sister' },
  { value: 'Loved_by_the_King', label: 'Loved by the King' },
  { value: 'Lovers_Quarrel', label: 'Lovers Quarrel' },
  { value: 'Luckiest_Guy', label: 'Luckiest Guy' },
  { value: 'Lusitana', label: 'Lusitana' },
  { value: 'Lustria', label: 'Lustria' },
  { value: 'Macondo', label: 'Macondo' },
  { value: 'Macondo_Swash_Caps', label: 'Macondo Swash Caps' },
  { value: 'Magra', label: 'Magra' },
  { value: 'Maiden_Orange', label: 'Maiden Orange' },
  { value: 'Mako', label: 'Mako' },
  { value: 'Mallanna', label: 'Mallanna' },
  { value: 'Mandali', label: 'Mandali' },
  { value: 'Marcellus', label: 'Marcellus' },
  { value: 'Marcellus_SC', label: 'Marcellus SC' },
  { value: 'Marck_Script', label: 'Marck Script' },
  { value: 'Margarine', label: 'Margarine' },
  { value: 'Marko_One', label: 'Marko One' },
  { value: 'Marmelad', label: 'Marmelad' },
  { value: 'Martel', label: 'Martel' },
  { value: 'Martel_Sans', label: 'Martel Sans' },
  { value: 'Marvel', label: 'Marvel' },
  { value: 'Mate', label: 'Mate' },
  { value: 'Mate_SC', label: 'Mate SC' },
  { value: 'Maven_Pro', label: 'Maven Pro' },
  { value: 'McLaren', label: 'McLaren' },
  { value: 'Meddon', label: 'Meddon' },
  { value: 'MedievalSharp', label: 'MedievalSharp' },
  { value: 'Medula_One', label: 'Medula One' },
  { value: 'Megrim', label: 'Megrim' },
  { value: 'Meie_Script', label: 'Meie Script' },
  { value: 'Merienda', label: 'Merienda' },
  { value: 'Merienda_One', label: 'Merienda One' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Merriweather_Sans', label: 'Merriweather Sans' },
  { value: 'Metal', label: 'Metal' },
  { value: 'Metal_Mania', label: 'Metal Mania' },
  { value: 'Metamorphous', label: 'Metamorphous' },
  { value: 'Metrophobic', label: 'Metrophobic' },
  { value: 'Michroma', label: 'Michroma' },
  { value: 'Milonga', label: 'Milonga' },
  { value: 'Miltonian', label: 'Miltonian' },
  { value: 'Miltonian_Tattoo', label: 'Miltonian Tattoo' },
  { value: 'Miniver', label: 'Miniver' },
  { value: 'Miss_Fajardose', label: 'Miss Fajardose' },
  { value: 'Modak', label: 'Modak' },
  { value: 'Modern_Antiqua', label: 'Modern Antiqua' },
  { value: 'Molengo', label: 'Molengo' },
  { value: 'Molle', label: 'Molle' },
  { value: 'Monda', label: 'Monda' },
  { value: 'Monofett', label: 'Monofett' },
  { value: 'Monoton', label: 'Monoton' },
  { value: 'Monsieur_La_Doulaise', label: 'Monsieur La Doulaise' },
  { value: 'Montaga', label: 'Montaga' },
  { value: 'Montez', label: 'Montez' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Montserrat_Alternates', label: 'Montserrat Alternates' },
  { value: 'Montserrat_Subrayada', label: 'Montserrat Subrayada' },
  { value: 'Moul', label: 'Moul' },
  { value: 'Moulpali', label: 'Moulpali' },
  { value: 'Mountains_of_Christmas', label: 'Mountains of Christmas' },
  { value: 'Mouse_Memoirs', label: 'Mouse Memoirs' },
  { value: 'Mr_Bedfort', label: 'Mr Bedfort' },
  { value: 'Mr_Dafoe', label: 'Mr Dafoe' },
  { value: 'Mr_De_Haviland', label: 'Mr De Haviland' },
  { value: 'Mrs_Saint_Delafield', label: 'Mrs Saint Delafield' },
  { value: 'Mrs_Sheppards', label: 'Mrs Sheppards' },
  { value: 'Muli', label: 'Muli' },
  { value: 'Mystery_Quest', label: 'Mystery Quest' },
  { value: 'NTR', label: 'NTR' },
  { value: 'Neucha', label: 'Neucha' },
  { value: 'Neuton', label: 'Neuton' },
  { value: 'New_Rocker', label: 'New Rocker' },
  { value: 'News_Cycle', label: 'News Cycle' },
  { value: 'Niconne', label: 'Niconne' },
  { value: 'Nixie_One', label: 'Nixie One' },
  { value: 'Nobile', label: 'Nobile' },
  { value: 'Nokora', label: 'Nokora' },
  { value: 'Norican', label: 'Norican' },
  { value: 'Nosifer', label: 'Nosifer' },
  { value: 'Nothing_You_Could_Do', label: 'Nothing You Could Do' },
  { value: 'Noticia_Text', label: 'Noticia Text' },
  { value: 'Noto_Sans', label: 'Noto Sans' },
  { value: 'Noto_Serif', label: 'Noto Serif' },
  { value: 'Nova_Cut', label: 'Nova Cut' },
  { value: 'Nova_Flat', label: 'Nova Flat' },
  { value: 'Nova_Mono', label: 'Nova Mono' },
  { value: 'Nova_Oval', label: 'Nova Oval' },
  { value: 'Nova_Round', label: 'Nova Round' },
  { value: 'Nova_Script', label: 'Nova Script' },
  { value: 'Nova_Slim', label: 'Nova Slim' },
  { value: 'Nova_Square', label: 'Nova Square' },
  { value: 'Numans', label: 'Numans' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Odor_Mean_Chey', label: 'Odor Mean Chey' },
  { value: 'Offside', label: 'Offside' },
  { value: 'Old_Standard_TT', label: 'Old Standard TT' },
  { value: 'Oldenburg', label: 'Oldenburg' },
  { value: 'Oleo_Script', label: 'Oleo Script' },
  { value: 'Oleo_Script_Swash_Caps', label: 'Oleo Script Swash Caps' },
  { value: 'Open_Sans', label: 'Open Sans' },
  { value: 'Open_Sans_Condensed', label: 'Open Sans Condensed' },
  { value: 'Oranienbaum', label: 'Oranienbaum' },
  { value: 'Orbitron', label: 'Orbitron' },
  { value: 'Oregano', label: 'Oregano' },
  { value: 'Orienta', label: 'Orienta' },
  { value: 'Original_Surfer', label: 'Original Surfer' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Over_the_Rainbow', label: 'Over the Rainbow' },
  { value: 'Overlock', label: 'Overlock' },
  { value: 'Overlock_SC', label: 'Overlock SC' },
  { value: 'Ovo', label: 'Ovo' },
  { value: 'Oxygen', label: 'Oxygen' },
  { value: 'Oxygen_Mono', label: 'Oxygen Mono' },
  { value: 'PT_Mono', label: 'PT Mono' },
  { value: 'PT_Sans', label: 'PT Sans' },
  { value: 'PT_Sans_Caption', label: 'PT Sans Caption' },
  { value: 'PT_Sans_Narrow', label: 'PT Sans Narrow' },
  { value: 'PT_Serif', label: 'PT Serif' },
  { value: 'PT_Serif_Caption', label: 'PT Serif Caption' },
  { value: 'Pacifico', label: 'Pacifico' },
  { value: 'Palanquin', label: 'Palanquin' },
  { value: 'Palanquin_Dark', label: 'Palanquin Dark' },
  { value: 'Paprika', label: 'Paprika' },
  { value: 'Parisienne', label: 'Parisienne' },
  { value: 'Passero_One', label: 'Passero One' },
  { value: 'Passion_One', label: 'Passion One' },
  { value: 'Pathway_Gothic_One', label: 'Pathway Gothic One' },
  { value: 'Patrick_Hand', label: 'Patrick Hand' },
  { value: 'Patrick_Hand_SC', label: 'Patrick Hand SC' },
  { value: 'Patua_One', label: 'Patua One' },
  { value: 'Paytone_One', label: 'Paytone One' },
  { value: 'Peddana', label: 'Peddana' },
  { value: 'Peralta', label: 'Peralta' },
  { value: 'Permanent_Marker', label: 'Permanent Marker' },
  { value: 'Petit_Formal_Script', label: 'Petit Formal Script' },
  { value: 'Petrona', label: 'Petrona' },
  { value: 'Philosopher', label: 'Philosopher' },
  { value: 'Piedra', label: 'Piedra' },
  { value: 'Pinyon_Script', label: 'Pinyon Script' },
  { value: 'Pirata_One', label: 'Pirata One' },
  { value: 'Plaster', label: 'Plaster' },
  { value: 'Play', label: 'Play' },
  { value: 'Playball', label: 'Playball' },
  { value: 'Playfair_Display', label: 'Playfair Display' },
  { value: 'Playfair_Display_SC', label: 'Playfair Display SC' },
  { value: 'Podkova', label: 'Podkova' },
  { value: 'Poiret_One', label: 'Poiret One' },
  { value: 'Poller_One', label: 'Poller One' },
  { value: 'Poly', label: 'Poly' },
  { value: 'Pompiere', label: 'Pompiere' },
  { value: 'Pontano_Sans', label: 'Pontano Sans' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Port_Lligat_Sans', label: 'Port Lligat Sans' },
  { value: 'Port_Lligat_Slab', label: 'Port Lligat Slab' },
  { value: 'Pragati_Narrow', label: 'Pragati Narrow' },
  { value: 'Prata', label: 'Prata' },
  { value: 'Preahvihear', label: 'Preahvihear' },
  { value: 'Press_Start_2P', label: 'Press Start 2P' },
  { value: 'Princess_Sofia', label: 'Princess Sofia' },
  { value: 'Prociono', label: 'Prociono' },
  { value: 'Prosto_One', label: 'Prosto One' },
  { value: 'Puritan', label: 'Puritan' },
  { value: 'Purple_Purse', label: 'Purple Purse' },
  { value: 'Quando', label: 'Quando' },
  { value: 'Quantico', label: 'Quantico' },
  { value: 'Quattrocento', label: 'Quattrocento' },
  { value: 'Quattrocento_Sans', label: 'Quattrocento Sans' },
  { value: 'Questrial', label: 'Questrial' },
  { value: 'Quicksand', label: 'Quicksand' },
  { value: 'Quintessential', label: 'Quintessential' },
  { value: 'Qwigley', label: 'Qwigley' },
  { value: 'Racing_Sans_One', label: 'Racing Sans One' },
  { value: 'Radley', label: 'Radley' },
  { value: 'Rajdhani', label: 'Rajdhani' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Raleway_Dots', label: 'Raleway Dots' },
  { value: 'Ramabhadra', label: 'Ramabhadra' },
  { value: 'Ramaraja', label: 'Ramaraja' },
  { value: 'Rambla', label: 'Rambla' },
  { value: 'Rammetto_One', label: 'Rammetto One' },
  { value: 'Ranchers', label: 'Ranchers' },
  { value: 'Rancho', label: 'Rancho' },
  { value: 'Ranga', label: 'Ranga' },
  { value: 'Rationale', label: 'Rationale' },
  { value: 'Ravi_Prakash', label: 'Ravi Prakash' },
  { value: 'Redressed', label: 'Redressed' },
  { value: 'Reenie_Beanie', label: 'Reenie Beanie' },
  { value: 'Revalia', label: 'Revalia' },
  { value: 'Rhodium_Libre', label: 'Rhodium Libre' },
  { value: 'Ribeye', label: 'Ribeye' },
  { value: 'Ribeye_Marrow', label: 'Ribeye Marrow' },
  { value: 'Righteous', label: 'Righteous' },
  { value: 'Risque', label: 'Risque' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Roboto_Condensed', label: 'Roboto Condensed' },
  { value: 'Roboto_Mono', label: 'Roboto Mono' },
  { value: 'Roboto_Slab', label: 'Roboto Slab' },
  { value: 'Rochester', label: 'Rochester' },
  { value: 'Rock_Salt', label: 'Rock Salt' },
  { value: 'Rokkitt', label: 'Rokkitt' },
  { value: 'Romanesco', label: 'Romanesco' },
  { value: 'Ropa_Sans', label: 'Ropa Sans' },
  { value: 'Rosario', label: 'Rosario' },
  { value: 'Rosarivo', label: 'Rosarivo' },
  { value: 'Rouge_Script', label: 'Rouge Script' },
  { value: 'Rozha_One', label: 'Rozha One' },
  { value: 'Rubik', label: 'Rubik' },
  { value: 'Rubik_Mono_One', label: 'Rubik Mono One' },
  { value: 'Rubik_One', label: 'Rubik One' },
  { value: 'Ruda', label: 'Ruda' },
  { value: 'Rufina', label: 'Rufina' },
  { value: 'Ruge_Boogie', label: 'Ruge Boogie' },
  { value: 'Ruluko', label: 'Ruluko' },
  { value: 'Rum_Raisin', label: 'Rum Raisin' },
  { value: 'Ruslan_Display', label: 'Ruslan Display' },
  { value: 'Russo_One', label: 'Russo One' },
  { value: 'Ruthie', label: 'Ruthie' },
  { value: 'Rye', label: 'Rye' },
  { value: 'Sacramento', label: 'Sacramento' },
  { value: 'Sahitya', label: 'Sahitya' },
  { value: 'Sail', label: 'Sail' },
  { value: 'Salsa', label: 'Salsa' },
  { value: 'Sanchez', label: 'Sanchez' },
  { value: 'Sancreek', label: 'Sancreek' },
  { value: 'Sansita_One', label: 'Sansita One' },
  { value: 'Sarala', label: 'Sarala' },
  { value: 'Sarabun', label: 'Sarabun' },
  { value: 'Sarina', label: 'Sarina' },
  { value: 'Sarpanch', label: 'Sarpanch' },
  { value: 'Satisfy', label: 'Satisfy' },
  { value: 'Scada', label: 'Scada' },
  { value: 'Scheherazade', label: 'Scheherazade' },
  { value: 'Schoolbell', label: 'Schoolbell' },
  { value: 'Seaweed_Script', label: 'Seaweed Script' },
  { value: 'Sevillana', label: 'Sevillana' },
  { value: 'Seymour_One', label: 'Seymour One' },
  { value: 'Shadows_Into_Light', label: 'Shadows Into Light' },
  { value: 'Shadows_Into_Light_Two', label: 'Shadows Into Light Two' },
  { value: 'Shanti', label: 'Shanti' },
  { value: 'Share', label: 'Share' },
  { value: 'Share_Tech', label: 'Share Tech' },
  { value: 'Share_Tech_Mono', label: 'Share Tech Mono' },
  { value: 'Shojumaru', label: 'Shojumaru' },
  { value: 'Short_Stack', label: 'Short Stack' },
  { value: 'Siemreap', label: 'Siemreap' },
  { value: 'Sigmar_One', label: 'Sigmar One' },
  { value: 'Signika', label: 'Signika' },
  { value: 'Signika_Negative', label: 'Signika Negative' },
  { value: 'Simonetta', label: 'Simonetta' },
  { value: 'Sintony', label: 'Sintony' },
  { value: 'Sirin_Stencil', label: 'Sirin Stencil' },
  { value: 'Six_Caps', label: 'Six Caps' },
  { value: 'Skranji', label: 'Skranji' },
  { value: 'Slabo_13px', label: 'Slabo 13px' },
  { value: 'Slabo_27px', label: 'Slabo 27px' },
  { value: 'Slackey', label: 'Slackey' },
  { value: 'Smokum', label: 'Smokum' },
  { value: 'Smythe', label: 'Smythe' },
  { value: 'Sniglet', label: 'Sniglet' },
  { value: 'Snippet', label: 'Snippet' },
  { value: 'Snowburst_One', label: 'Snowburst One' },
  { value: 'Sofadi_One', label: 'Sofadi One' },
  { value: 'Sofia', label: 'Sofia' },
  { value: 'Sonsie_One', label: 'Sonsie One' },
  { value: 'Sorts_Mill_Goudy', label: 'Sorts Mill Goudy' },
  { value: 'Source_Code_Pro', label: 'Source Code Pro' },
  { value: 'Source_Sans_Pro', label: 'Source Sans Pro' },
  { value: 'Source_Serif_Pro', label: 'Source Serif Pro' },
  { value: 'Special_Elite', label: 'Special Elite' },
  { value: 'Spicy_Rice', label: 'Spicy Rice' },
  { value: 'Spinnaker', label: 'Spinnaker' },
  { value: 'Spirax', label: 'Spirax' },
  { value: 'Squada_One', label: 'Squada One' },
  { value: 'Sree_Krushnadevaraya', label: 'Sree Krushnadevaraya' },
  { value: 'Stalemate', label: 'Stalemate' },
  { value: 'Stalinist_One', label: 'Stalinist One' },
  { value: 'Stardos_Stencil', label: 'Stardos Stencil' },
  { value: 'Stint_Ultra_Condensed', label: 'Stint Ultra Condensed' },
  { value: 'Stint_Ultra_Expanded', label: 'Stint Ultra Expanded' },
  { value: 'Stoke', label: 'Stoke' },
  { value: 'Strait', label: 'Strait' },
  { value: 'Sue_Ellen_Francisco', label: 'Sue Ellen Francisco' },
  { value: 'Sumana', label: 'Sumana' },
  { value: 'Sunshiney', label: 'Sunshiney' },
  { value: 'Supermercado_One', label: 'Supermercado One' },
  { value: 'Sura', label: 'Sura' },
  { value: 'Suranna', label: 'Suranna' },
  { value: 'Suravaram', label: 'Suravaram' },
  { value: 'Suwannaphum', label: 'Suwannaphum' },
  { value: 'Swanky_and_Moo_Moo', label: 'Swanky and Moo Moo' },
  { value: 'Syncopate', label: 'Syncopate' },
  { value: 'Tangerine', label: 'Tangerine' },
  { value: 'Taprom', label: 'Taprom' },
  { value: 'Tauri', label: 'Tauri' },
  { value: 'Teko', label: 'Teko' },
  { value: 'Telex', label: 'Telex' },
  { value: 'Tenali_Ramakrishna', label: 'Tenali Ramakrishna' },
  { value: 'Tenor_Sans', label: 'Tenor Sans' },
  { value: 'Text_Me_One', label: 'Text Me One' },
  { value: 'The_Girl_Next_Door', label: 'The Girl Next Door' },
  { value: 'Tienne', label: 'Tienne' },
  { value: 'Tillana', label: 'Tillana' },
  { value: 'Timmana', label: 'Timmana' },
  { value: 'Tinos', label: 'Tinos' },
  { value: 'Titan_One', label: 'Titan One' },
  { value: 'Titillium_Web', label: 'Titillium Web' },
  { value: 'Trade_Winds', label: 'Trade Winds' },
  { value: 'Trocchi', label: 'Trocchi' },
  { value: 'Trochut', label: 'Trochut' },
  { value: 'Trykker', label: 'Trykker' },
  { value: 'Tulpen_One', label: 'Tulpen One' },
  { value: 'Ubuntu', label: 'Ubuntu' },
  { value: 'Ubuntu_Condensed', label: 'Ubuntu Condensed' },
  { value: 'Ubuntu_Mono', label: 'Ubuntu Mono' },
  { value: 'Ultra', label: 'Ultra' },
  { value: 'Uncial_Antiqua', label: 'Uncial Antiqua' },
  { value: 'Underdog', label: 'Underdog' },
  { value: 'Unica_One', label: 'Unica One' },
  { value: 'UnifrakturCook', label: 'UnifrakturCook' },
  { value: 'UnifrakturMaguntia', label: 'UnifrakturMaguntia' },
  { value: 'Unkempt', label: 'Unkempt' },
  { value: 'Unlock', label: 'Unlock' },
  { value: 'Unna', label: 'Unna' },
  { value: 'VT323', label: 'VT323' },
  { value: 'Vampiro_One', label: 'Vampiro One' },
  { value: 'Varela', label: 'Varela' },
  { value: 'Varela_Round', label: 'Varela Round' },
  { value: 'Vast_Shadow', label: 'Vast Shadow' },
  { value: 'Vesper_Libre', label: 'Vesper Libre' },
  { value: 'Vibur', label: 'Vibur' },
  { value: 'Vidaloka', label: 'Vidaloka' },
  { value: 'Viga', label: 'Viga' },
  { value: 'Voces', label: 'Voces' },
  { value: 'Volkhov', label: 'Volkhov' },
  { value: 'Vollkorn', label: 'Vollkorn' },
  { value: 'Voltaire', label: 'Voltaire' },
  { value: 'Waiting_for_the_Sunrise', label: 'Waiting for the Sunrise' },
  { value: 'Wallpoet', label: 'Wallpoet' },
  { value: 'Walter_Turncoat', label: 'Walter Turncoat' },
  { value: 'Warnes', label: 'Warnes' },
  { value: 'Wellfleet', label: 'Wellfleet' },
  { value: 'Wendy_One', label: 'Wendy One' },
  { value: 'Wire_One', label: 'Wire One' },
  { value: 'Work_Sans', label: 'Work Sans' },
  { value: 'Yanone_Kaffeesatz', label: 'Yanone Kaffeesatz' },
  { value: 'Yantramanav', label: 'Yantramanav' },
  { value: 'Yellowtail', label: 'Yellowtail' },
  { value: 'Yeseva_One', label: 'Yeseva One' },
  { value: 'Yesteryear', label: 'Yesteryear' },
  { value: 'Zeyada', label: 'Zeyada' },
];

export default function GeneralSettings() {
  const [t] = useTranslation();

  const company = useCompanyChanges();
  const currentCompany = useCurrentCompany();

  const disableSettingsField = useDisableSettingsField();

  const errors = useAtomValue(companySettingsErrorsAtom);

  const [updatingRecords, setUpdatingRecords] = useAtom(updatingRecordsAtom);
  const [logoSizeType, setLogoSizeType] = useState<'%' | 'px'>('%');

  const { data: designs } = useDesignsQuery();
  const { data: invoiceDesigns } = useTemplateQuery('invoice');
  const { data: paymentDesigns } = useTemplateQuery('payment');
  const { data: statementDesigns } = useTemplateQuery('statement');

  const isDesignChanged = (property: keyof Company['settings']) => {
    return currentCompany?.settings[property] !== company?.settings[property];
  };

  const isUpdateAllRecordsChecked = (
    property: 'invoice' | 'quote' | 'credit' | 'purchase_order'
  ) => {
    return Boolean(updatingRecords?.find((value) => value.entity === property));
  };

  const handleChange = useHandleSettingsValueChange();

  const handleUpdateAllRecordsChange = (
    property: 'invoice' | 'quote' | 'credit' | 'purchase_order',
    setting: keyof Company['settings'],
    value: boolean
  ) => {
    if (value) {
      return setUpdatingRecords((current) => [
        ...current,
        {
          design_id: company?.settings[setting],
          entity: property,
        },
      ]);
    }

    setUpdatingRecords((current) =>
      current.filter((value) => value.entity !== property)
    );
  };

  useEffect(() => {
    if (company?.settings && company?.settings.company_logo_size) {
      const value = company.settings.company_logo_size
        ?.replaceAll('%', '')
        ?.replaceAll('px', '');

      if (value) {
        handleChange('company_logo_size', `${value}${logoSizeType}`);
      } else {
        handleChange('company_logo_size', '');
      }
    }
  }, [logoSizeType]);

  useEffect(() => {
    if (
      company?.settings &&
      company?.settings.company_logo_size?.includes('px')
    ) {
      setLogoSizeType('px');
    }
  }, [company?.settings?.company_logo_size]);

  useEffect(() => {
    setUpdatingRecords([]);
  }, []);

  const designsFilter = (entity: string, designs: Design[]) => {
    return (
      designs.filter(
        (design: Design) =>
          design.is_template === false || design.entities.match(entity)
      ) ?? designs
    );
  };

  return (
    <>
      <AdvancedSettingsPlanAlert />

      <Card title={t('general_settings')} padding="small">
        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="invoice_design_id"
              labelElement={<SettingsLabel label={t('invoice_design')} />}
              defaultValue="VolejRejNm"
            />
          }
        >
          <div className="flex flex-col space-y-3">
            <SelectField
              id="settings.invoice_design_id"
              value={company?.settings?.invoice_design_id || 'VolejRejNm'}
              onValueChange={(value) =>
                handleChange('invoice_design_id', value)
              }
              disabled={disableSettingsField('invoice_design_id')}
              errorMessage={errors?.errors['settings.invoice_design_id']}
              customSelector
              dismissable={false}
            >
              {designs &&
                designsFilter('invoice', designs).map((design: Design) => (
                  <option key={design.id} value={design.id}>
                    {design.name}
                  </option>
                ))}
            </SelectField>

            {isDesignChanged('invoice_design_id') && (
              <div className="flex space-x-10">
                <span
                  className={classNames({
                    'opacity-75': disableSettingsField('invoice_design_id'),
                  })}
                >
                  {t('update_all_records')}
                </span>
                <Toggle
                  checked={isUpdateAllRecordsChecked('invoice')}
                  disabled={disableSettingsField('invoice_design_id')}
                  onValueChange={(value) =>
                    handleUpdateAllRecordsChange(
                      'invoice',
                      'invoice_design_id',
                      value
                    )
                  }
                />
              </div>
            )}
          </div>
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="quote_design_id"
              labelElement={<SettingsLabel label={t('quote_design')} />}
              defaultValue="VolejRejNm"
            />
          }
        >
          <div className="flex flex-col space-y-3">
            <SelectField
              id="settings.quote_design_id"
              value={company?.settings?.quote_design_id || 'VolejRejNm'}
              onValueChange={(value) => handleChange('quote_design_id', value)}
              disabled={disableSettingsField('quote_design_id')}
              errorMessage={errors?.errors['settings.quote_design_id']}
              customSelector
              dismissable={false}
            >
              {designs &&
                designsFilter('quote', designs).map((design: Design) => (
                  <option key={design.id} value={design.id}>
                    {design.name}
                  </option>
                ))}
            </SelectField>

            {isDesignChanged('quote_design_id') && (
              <div className="flex space-x-10">
                <span
                  className={classNames({
                    'opacity-75': disableSettingsField('quote_design_id'),
                  })}
                >
                  {t('update_all_records')}
                </span>
                <Toggle
                  checked={isUpdateAllRecordsChecked('quote')}
                  onValueChange={(value) =>
                    handleUpdateAllRecordsChange(
                      'quote',
                      'quote_design_id',
                      value
                    )
                  }
                  disabled={disableSettingsField('quote_design_id')}
                />
              </div>
            )}
          </div>
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="credit_design_id"
              labelElement={<SettingsLabel label={t('credit_design')} />}
              defaultValue="VolejRejNm"
            />
          }
        >
          <div className="flex flex-col space-y-3">
            <SelectField
              id="settings.credit_design_id"
              value={company?.settings?.credit_design_id || 'VolejRejNm'}
              onValueChange={(value) => handleChange('credit_design_id', value)}
              disabled={disableSettingsField('credit_design_id')}
              errorMessage={errors?.errors['settings.credit_design_id']}
              customSelector
              dismissable={false}
            >
              {designs &&
                designsFilter('credit', designs).map((design: Design) => (
                  <option key={design.id} value={design.id}>
                    {design.name}
                  </option>
                ))}
            </SelectField>

            {isDesignChanged('credit_design_id') && (
              <div className="flex space-x-10">
                <span
                  className={classNames({
                    'opacity-75': disableSettingsField('credit_design_id'),
                  })}
                >
                  {t('update_all_records')}
                </span>
                <Toggle
                  checked={isUpdateAllRecordsChecked('credit')}
                  onValueChange={(value) =>
                    handleUpdateAllRecordsChange(
                      'credit',
                      'credit_design_id',
                      value
                    )
                  }
                  disabled={disableSettingsField('credit_design_id')}
                />
              </div>
            )}
          </div>
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="purchase_order_design_id"
              labelElement={
                <SettingsLabel label={t('purchase_order_design')} />
              }
              defaultValue="VolejRejNm"
            />
          }
        >
          <div className="flex flex-col space-y-3">
            <SelectField
              id="settings.purchase_order_design_id"
              value={
                company?.settings?.purchase_order_design_id || 'VolejRejNm'
              }
              onValueChange={(value) =>
                handleChange('purchase_order_design_id', value)
              }
              disabled={disableSettingsField('purchase_order_design_id')}
              errorMessage={errors?.errors['settings.purchase_order_design_id']}
              customSelector
              dismissable={false}
            >
              {designs &&
                designsFilter('purchase_order', designs).map(
                  (design: Design) => (
                    <option key={design.id} value={design.id}>
                      {design.name}
                    </option>
                  )
                )}
            </SelectField>

            {isDesignChanged('purchase_order_design_id') && (
              <div className="flex space-x-10">
                <span
                  className={classNames({
                    'opacity-75': disableSettingsField(
                      'purchase_order_design_id'
                    ),
                  })}
                >
                  {t('update_all_records')}
                </span>
                <Toggle
                  checked={isUpdateAllRecordsChecked('purchase_order')}
                  onValueChange={(value) =>
                    handleUpdateAllRecordsChange(
                      'purchase_order',
                      'purchase_order_design_id',
                      value
                    )
                  }
                  disabled={disableSettingsField('purchase_order_design_id')}
                />
              </div>
            )}
          </div>
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="statement_design_id"
              labelElement={<SettingsLabel label={t('statement_design')} />}
              defaultValue=""
            />
          }
        >
          <div className="flex flex-col space-y-3">
            <SelectField
              id="settings.statement_design_id"
              value={company?.settings?.statement_design_id || ''}
              onValueChange={(value) =>
                handleChange('statement_design_id', value)
              }
              disabled={disableSettingsField('statement_design_id')}
              errorMessage={errors?.errors['settings.statement_design_id']}
              customSelector
              withBlank
            >
              {statementDesigns &&
                statementDesigns.map((design: Design) => (
                  <option key={design.id} value={design.id}>
                    {design.name}
                  </option>
                ))}
            </SelectField>
          </div>
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="delivery_note_design_id"
              labelElement={<SettingsLabel label={t('delivery_note_design')} />}
              defaultValue=""
            />
          }
        >
          <div className="flex flex-col space-y-3">
            <SelectField
              id="settings.delivery_note_design_id"
              value={company?.settings?.delivery_note_design_id || ''}
              onValueChange={(value) =>
                handleChange('delivery_note_design_id', value)
              }
              disabled={disableSettingsField('delivery_note_design_id')}
              errorMessage={errors?.errors['settings.delivery_note_design_id']}
              customSelector
              withBlank
            >
              {invoiceDesigns &&
                invoiceDesigns.map((design: Design) => (
                  <option key={design.id} value={design.id}>
                    {design.name}
                  </option>
                ))}
            </SelectField>
          </div>
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="payment_receipt_design_id"
              labelElement={
                <SettingsLabel label={t('payment_receipt_design')} />
              }
              defaultValue=""
            />
          }
        >
          <div className="flex flex-col space-y-3">
            <SelectField
              id="settings.payment_receipt_design_id"
              value={company?.settings?.payment_receipt_design_id || ''}
              onValueChange={(value) =>
                handleChange('payment_receipt_design_id', value)
              }
              disabled={disableSettingsField('payment_receipt_design_id')}
              errorMessage={
                errors?.errors['settings.payment_receipt_design_id']
              }
              customSelector
              withBlank
            >
              {paymentDesigns &&
                paymentDesigns.map((design: Design) => (
                  <option key={design.id} value={design.id}>
                    {design.name}
                  </option>
                ))}
            </SelectField>
          </div>
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="payment_refund_design_id"
              labelElement={
                <SettingsLabel label={t('payment_refund_design')} />
              }
              defaultValue=""
            />
          }
        >
          <div className="flex flex-col space-y-3">
            <SelectField
              id="settings.payment_refund_design_id"
              value={company?.settings?.payment_refund_design_id || ''}
              onValueChange={(value) =>
                handleChange('payment_refund_design_id', value)
              }
              disabled={disableSettingsField('payment_refund_design_id')}
              errorMessage={errors?.errors['settings.payment_refund_design_id']}
              customSelector
              withBlank
            >
              {paymentDesigns &&
                paymentDesigns.map((design: Design) => (
                  <option key={design.id} value={design.id}>
                    {design.name}
                  </option>
                ))}
            </SelectField>
          </div>
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="page_layout"
              labelElement={<SettingsLabel label={t('page_layout')} />}
              defaultValue="portrait"
            />
          }
        >
          <SelectField
            id="settings.page_layout"
            value={company?.settings?.page_layout || 'portrait'}
            onValueChange={(value) => handleChange('page_layout', value)}
            disabled={disableSettingsField('page_layout')}
            errorMessage={errors?.errors['settings.page_layout']}
            customSelector
            dismissable={false}
          >
            <option value="portrait">{t('portrait')}</option>
            <option value="landscape">{t('landscape')}</option>
          </SelectField>
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="page_size"
              labelElement={<SettingsLabel label={t('page_size')} />}
              defaultValue="A4"
            />
          }
        >
          <SelectField
            id="settings.page_size"
            value={company?.settings?.page_size || 'A4'}
            onValueChange={(value) => handleChange('page_size', value)}
            disabled={disableSettingsField('page_size')}
            errorMessage={errors?.errors['settings.page_size']}
            customSelector
            dismissable={false}
          >
            <option value="A5">A5</option>
            <option value="A4">A4</option>
            <option value="A3">A3</option>
            <option value="B5">B5</option>
            <option value="B4">B4</option>
            <option value="JIS-B5">JIS-B5</option>
            <option value="JIS-B4">JIS-B4</option>
            <option value="letter">Letter</option>
            <option value="legal">Legal</option>
            <option value="ledger">Ledger</option>
          </SelectField>
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="font_size"
              labelElement={<SettingsLabel label={t('font_size')} />}
              defaultValue={16}
            />
          }
        >
          <SelectField
            id="settings.font_size"
            value={company?.settings?.font_size || 16}
            onValueChange={(value) =>
              handleChange('font_size', parseInt(value))
            }
            disabled={disableSettingsField('font_size')}
            errorMessage={errors?.errors['settings.font_size']}
            customSelector
            dismissable={false}
          >
            {range(6, 41, 2).map((number) => (
              <option key={number} value={number}>
                {number}
              </option>
            ))}
          </SelectField>
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="company_logo_size"
              labelElement={<SettingsLabel label={t('logo_size')} />}
            />
          }
        >
          <div className="w-full inline-flex items-center space-x-2">
            <div className="w-full">
              <NumberInputField
                value={(company?.settings.company_logo_size || '')
                  ?.replaceAll('px', '')
                  ?.replaceAll('%', '')}
                onValueChange={(value) =>
                  handleChange(
                    'company_logo_size',
                    value ? `${parseFloat(value) || 0}${logoSizeType}` : ''
                  )
                }
                disabled={disableSettingsField('company_logo_size')}
                errorMessage={errors?.errors['settings.company_logo_size']}
              />
            </div>

            <div className="w-1/3">
              <SelectField
                value={logoSizeType}
                onValueChange={(value) => setLogoSizeType(value as 'px' | '%')}
                disabled={disableSettingsField('company_logo_size')}
                customSelector
                dismissable={false}
              >
                <option value="%">{t('percent')}</option>
                <option value="px">{t('pixels')}</option>
              </SelectField>
            </div>
          </div>
        </Element>

        <Divider />

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="primary_font"
              labelElement={<SettingsLabel label={t('primary_font')} />}
              defaultValue="roboto"
            />
          }
        >
          <SelectField
            id="settings.primary_font"
            value={company?.settings?.primary_font || 'roboto'}
            onValueChange={(value) => handleChange('primary_font', value)}
            disabled={disableSettingsField('primary_font')}
            errorMessage={errors?.errors['settings.primary_font']}
            customSelector
            dismissable={false}
          >
            {fonts.map((font) => (
              <option key={font.label} value={font.value}>
                {font.label}
              </option>
            ))}
          </SelectField>
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="secondary_font"
              labelElement={<SettingsLabel label={t('secondary_font')} />}
              defaultValue="roboto"
            />
          }
        >
          <SelectField
            id="settings.secondary_font"
            value={company?.settings?.secondary_font || 'roboto'}
            onValueChange={(value) => handleChange('secondary_font', value)}
            disabled={disableSettingsField('secondary_font')}
            errorMessage={errors?.errors['settings.secondary_font']}
            customSelector
            dismissable={false}
          >
            {fonts.map((font) => (
              <option key={font.label} value={font.value}>
                {font.label}
              </option>
            ))}
          </SelectField>
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="primary_color"
              labelElement={<SettingsLabel label={t('primary_color')} />}
              defaultValue={colors.primary}
            />
          }
        >
          <ColorPicker
            value={company?.settings?.primary_color || colors.primary}
            onValueChange={(value) => {
              const currentColor = company?.settings?.primary_color;

              if ((!currentColor && value !== colors.primary) || currentColor) {
                handleChange('primary_color', value);
              }
            }}
            disabled={disableSettingsField('primary_color')}
            includeDefaultPalette
          />
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="secondary_color"
              labelElement={<SettingsLabel label={t('secondary_color')} />}
              defaultValue={colors.secondary}
            />
          }
        >
          <ColorPicker
            value={company?.settings?.secondary_color || colors.secondary}
            onValueChange={(value) => {
              const currentColor = company?.settings?.secondary_color;

              if (
                (!currentColor && value !== colors.secondary) ||
                currentColor
              ) {
                handleChange('secondary_color', value);
              }
            }}
            disabled={disableSettingsField('secondary_color')}
            includeDefaultPalette
          />
        </Element>

        <Divider />

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="show_paid_stamp"
              labelElement={<SettingsLabel label={t('show_paid_stamp')} />}
              defaultValue={false}
            />
          }
        >
          <Toggle
            onValueChange={(value) => handleChange('show_paid_stamp', value)}
            checked={Boolean(company?.settings.show_paid_stamp)}
            disabled={disableSettingsField('show_paid_stamp')}
          />
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="show_shipping_address"
              labelElement={
                <SettingsLabel label={t('show_shipping_address')} />
              }
              defaultValue={false}
            />
          }
        >
          <Toggle
            onValueChange={(value) =>
              handleChange('show_shipping_address', value)
            }
            checked={Boolean(company?.settings.show_shipping_address)}
            disabled={disableSettingsField('show_shipping_address')}
          />
        </Element>

        <Element
          leftSideHelp={t('invoice_embed_documents_help')}
          leftSide={
            <PropertyCheckbox
              propertyKey="embed_documents"
              labelElement={
                <SettingsLabel label={t('invoice_embed_documents')} />
              }
              defaultValue={false}
            />
          }
        >
          <Toggle
            onValueChange={(value) => handleChange('embed_documents', value)}
            checked={Boolean(company?.settings.embed_documents)}
            disabled={disableSettingsField('embed_documents')}
          />
        </Element>

        <Divider />

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="hide_empty_columns_on_pdf"
              labelElement={<SettingsLabel label={t('empty_columns')} />}
              defaultValue="false"
            />
          }
        >
          <Radio
            name="empty_columns"
            options={[
              { id: 'hide', title: t('hide'), value: 'true' },
              { id: 'show', title: t('show'), value: 'false' },
            ]}
            onValueChange={(value) =>
              handleChange(
                'hide_empty_columns_on_pdf',
                value === 'true' ? true : false
              )
            }
            defaultSelected={
              company?.settings?.hide_empty_columns_on_pdf?.toString() ??
              'false'
            }
            disabled={disableSettingsField('hide_empty_columns_on_pdf')}
          />
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="page_numbering"
              labelElement={<SettingsLabel label={t('page_numbering')} />}
              defaultValue={false}
            />
          }
        >
          <Toggle
            checked={Boolean(company?.settings?.page_numbering)}
            id="settings.page_numbering"
            onChange={(value) => handleChange('page_numbering', value)}
            disabled={disableSettingsField('page_numbering')}
          />
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="page_numbering_alignment"
              labelElement={
                <SettingsLabel label={t('page_numbering_alignment')} />
              }
              defaultValue="C"
            />
          }
        >
          <SelectField
            id="settings.page_numbering_alignment"
            disabled={
              !company?.settings?.page_numbering ||
              disableSettingsField('page_numbering_alignment')
            }
            value={
              company?.settings?.page_numbering_alignment?.toString() || 'C'
            }
            onValueChange={(value) =>
              handleChange('page_numbering_alignment', value)
            }
            errorMessage={errors?.errors['settings.page_numbering_alignment']}
            customSelector
            dismissable={false}
          >
            <option value="C">{t('center')}</option>
            <option value="R">{t('right')}</option>
            <option value="L">{t('left')}</option>
          </SelectField>
        </Element>
      </Card>
    </>
  );
}
