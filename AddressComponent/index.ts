/* eslint-disable */
import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class AddressComponent implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _context: ComponentFramework.Context<IInputs>
    private _container: HTMLDivElement;
    private _inputElement: HTMLInputElement;

    private _notifyOutputChanged: () => void;

    private autocomplete: google.maps.places.Autocomplete;
    private street: string;

    constructor()
    {

    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
    {
        this._context = context;
        this._notifyOutputChanged = notifyOutputChanged;
        this._container = container;

        this.street = this._context.parameters.street.raw != null ? this._context.parameters.street.raw : "";

        this._inputElement = document.createElement("input");
        this._inputElement.setAttribute("id", "addressautocomplete");
        this._inputElement.setAttribute("type", "text");
        this._inputElement.value = this.street;
        this._inputElement.setAttribute("class", "addressAutocomplete");
        this._container.appendChild(this._inputElement);

        this._inputElement.addEventListener("blur", () => {
            if (this.street != this._inputElement.value) {
                this.street = this._inputElement.value;
                this._notifyOutputChanged();
            }
        });

        container = this._container;
        const gmpMap = document.createElement('gmp-map');
        gmpMap.setAttribute('center', '37.4220656,-122.0840897');
        gmpMap.setAttribute('zoom', '12');
        gmpMap.setAttribute('map-id', 'DEMO_MAP_ID');
        gmpMap.style.height = '400px'; 
        this._container.appendChild(gmpMap)
        

        let scriptUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAo3AVFoGLIo0G5OFB4y6Jy27IQcQJnzX8&callback=initMap&v=beta&libraries=places,marker&callback=initAutocomplete" 

        let scriptNode = document.createElement('script');
        scriptNode.setAttribute('type', 'text/javascript');
        scriptNode.setAttribute('src', scriptUrl);
        scriptNode.setAttribute("defer","");
        document.head.append(scriptNode);


        (window as any).initAutocomplete = () => {
            console.log(this._inputElement)
            this.autocomplete = new google.maps.places.Autocomplete(this._inputElement, { types: ['geocode'] });
            this.autocomplete.addListener('place_changed', () => {
                let place = this.autocomplete.getPlace();
                if (!place.geometry) {
                    console.log("No details available for input: '" + place.name + "'");
                    return;
                }
               
                let location = place.geometry.location;
                gmpMap.setAttribute('center', location?.lat() + ',' + location?.lng());

                const gmpMarker = document.createElement('gmp-advanced-marker');
                gmpMarker.setAttribute('position',  location?.lat() + ',' + location?.lng());

                gmpMap.appendChild(gmpMarker);

                this._inputElement.value = place.formatted_address!;
                this.street = place.formatted_address!;
                this._notifyOutputChanged();
            });
        };
        this._notifyOutputChanged();
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void
    {
        // Add code to update control view
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs
    {
        return {
            street: this.street,
        };
    }


    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void
    {
        // Add code to cleanup control if necessary
    }
}
