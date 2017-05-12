package org.cloudsky.cordovaPlugins;

import java.io.IOException;
import java.lang.RuntimeException;
import org.json.JSONException;
import org.json.JSONObject;

import android.Manifest;
import android.app.Activity;
import android.app.Dialog;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.hardware.Camera;
import android.hardware.Camera.CameraInfo;
import android.hardware.Camera.Parameters;
import android.hardware.Camera.PreviewCallback;
import android.hardware.Camera.AutoFocusCallback;
import android.os.Bundle;
import android.os.Handler;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.util.Log;
import android.view.Gravity;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.content.pm.PackageManager;
import android.view.Surface;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.Toast;
import android.view.View.OnClickListener;

import java.util.regex.Pattern;
import java.util.regex.Matcher;

import java.util.ArrayList;
import java.util.Collection;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import net.sourceforge.zbar.ImageScanner;
import net.sourceforge.zbar.Image;
import net.sourceforge.zbar.Symbol;
import net.sourceforge.zbar.SymbolSet;
import net.sourceforge.zbar.Config;

import org.cloudsky.cordovaPlugins.ZBarcodeFormat;

public class ZBarScannerActivity extends Activity
        implements SurfaceHolder.Callback {

    //for barcode types
    private Collection<ZBarcodeFormat> mFormats = null;

    // Config ----------------------------------------------------------

    private static int autoFocusInterval = 500; // Interval between AFcallback and next AF attempt.

    // Public Constants ------------------------------------------------

    public static final String EXTRA_QRVALUE = "qrValue";
    public static final String EXTRA_QRFORMAT = "NONE";
    public static final String EXTRA_QROPEN = "true";
    public static final String EXTRA_PARAMS = "params";

    public static final int RESULT_ERROR = RESULT_FIRST_USER + 1;
    public static final int RESULT_STATE_SETTINGS = RESULT_FIRST_USER + 2;
    public static final int RESULT_STATE_MAP = RESULT_FIRST_USER + 3;
    public static final int RESULT_STATE_LOGIN = RESULT_FIRST_USER + 4;
    public static final int RESULT_STATE_HELP = RESULT_FIRST_USER + 5;
    private static final int CAMERA_PERMISSION_REQUEST = 1;
    // State -----------------------------------------------------------

    private Camera camera;
    private Handler autoFocusHandler;
    private SurfaceView scannerSurface;
    private SurfaceHolder holder;
    private ImageScanner scanner;
    private int surfW, surfH;

    // Customisable stuff
    String whichCamera;
    String flashMode;
    Boolean isConnected;
    Boolean askOpen;

    // For retrieving R.* resources, from the actual app package
    // (we can't use actual.application.package.R.* in our code as we
    // don't know the applciation package name when writing this plugin).
    private String package_name;
    private Resources resources;

    ImageButton buttonMap;
    ImageButton buttonScan;
    ImageButton buttonSettings;
    ImageButton buttonLogin;
    ImageButton buttonHelp;
    ImageButton buttonFlash;

    // Static initialisers (class) -------------------------------------

    static {
        // Needed by ZBar??
        System.loadLibrary("iconv");
    }

    // Activity Lifecycle ----------------------------------------------

    @Override
    public void onCreate (Bundle savedInstanceState) {


        int permissionCheck = ContextCompat.checkSelfPermission(this.getBaseContext(), Manifest.permission.CAMERA);

        if(permissionCheck == PackageManager.PERMISSION_GRANTED){

            setUpCamera();

        } else {

            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.CAMERA},
                    CAMERA_PERMISSION_REQUEST);
        }
        super.onCreate(savedInstanceState);


    }
    public void onRequestPermissionsResult(int requestCode,
                                           String permissions[], int[] grantResults) {
        switch (requestCode) {
            case CAMERA_PERMISSION_REQUEST: {
                if (grantResults.length > 0
                        && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    setUpCamera();
                } else {

                    onBackPressed();
                }
                return;
            }

            // other 'case' lines to check for other
            // permissions this app might request
        }
    }
    private void setUpCamera() {
        // If request is cancelled, the result arrays are empty.

        // Get parameters from JS
        Intent startIntent = getIntent();
        String paramStr = startIntent.getStringExtra(EXTRA_PARAMS);
        JSONObject params;
        try { params = new JSONObject(paramStr); }
        catch (JSONException e) { params = new JSONObject(); }
        Boolean drawSight = params.optBoolean("drawSight", true);
        isConnected = params.optBoolean("connected");
        whichCamera = params.optString("camera");
        askOpen = params.optBoolean("askOpen");
        flashMode = params.optString("flash");

        // Initiate instance variables
        autoFocusHandler = new Handler();
        scanner = new ImageScanner();
        scanner.setConfig(0, Config.X_DENSITY, 3);
        scanner.setConfig(0, Config.Y_DENSITY, 3);

        // Set the config for barcode formats
        for(ZBarcodeFormat format : getFormats()) {
            scanner.setConfig(format.getId(), Config.ENABLE, 1);
        }

        // Set content view
        setContentView(getResourceId("layout/cszbarscanner"));

        // Draw/hide the sight
        if(!drawSight) {
            findViewById(getResourceId("id/csZbarScannerSight")).setVisibility(View.INVISIBLE);
        }

        // Draw/hide the login button in top bar
        if(isConnected) {
            findViewById(getResourceId("id/topBarDroite")).setVisibility(TextView.INVISIBLE);
        } else {
            findViewById(getResourceId("id/topBarDroite")).setVisibility(TextView.VISIBLE);
        }

        // Create preview SurfaceView
        scannerSurface = new SurfaceView (this) {
            @Override
            public void onSizeChanged (int w, int h, int oldW, int oldH) {
                surfW = w;
                surfH = h;
                matchSurfaceToPreviewRatio();
            }
        };
        scannerSurface.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
                Gravity.CENTER
        ));
        scannerSurface.getHolder().addCallback(this);

        // Add preview SurfaceView to the screen
        FrameLayout scannerView = (FrameLayout) findViewById(getResourceId("id/csZbarScannerView"));
        scannerView.addView(scannerSurface);

        findViewById(getResourceId("id/scanTopBar")).bringToFront();
        findViewById(getResourceId("id/scanBottomBar")).bringToFront();
        findViewById(getResourceId("id/scanBottomText")).bringToFront();
        findViewById(getResourceId("id/buttonFlash")).bringToFront();
        findViewById(getResourceId("id/buttonHelp")).bringToFront();
        findViewById(getResourceId("id/csZbarScannerSightContainer")).bringToFront();
        findViewById(getResourceId("id/csZbarScannerSight")).bringToFront();

        scannerView.requestLayout();
        scannerView.invalidate();

        addListenerOnButton();
    }

    @Override
    public void onResume ()
    {
        super.onResume();

        try {
            if(whichCamera.equals("front")) {
                int numCams = Camera.getNumberOfCameras();
                CameraInfo cameraInfo = new CameraInfo();
                for(int i=0; i<numCams; i++) {
                    Camera.getCameraInfo(i, cameraInfo);
                    if(cameraInfo.facing == CameraInfo.CAMERA_FACING_FRONT) {
                        camera = Camera.open(i);
                    }
                }
            } else {
                camera = Camera.open();
            }

            if(camera == null) throw new Exception ("Error: No suitable camera found.");
        } catch (RuntimeException e) {
            die("Error: Could not open the camera.");
            return;
        } catch (Exception e) {
            die(e.getMessage());
            return;
        }

        Camera.Parameters camParams = camera.getParameters();
        if(flashMode.equals("on")) {
            camParams.setFlashMode(Camera.Parameters.FLASH_MODE_ON);
        } else if(flashMode.equals("off")) {
            camParams.setFlashMode(Camera.Parameters.FLASH_MODE_OFF);
        } else {
            camParams.setFlashMode(Camera.Parameters.FLASH_MODE_AUTO);
        }
        if (android.os.Build.VERSION.SDK_INT >= 14) {
            camParams.setFocusMode(Camera.Parameters.FOCUS_MODE_CONTINUOUS_PICTURE);
        }

        try { camera.setParameters(camParams); }
        catch (RuntimeException e) {
            Log.d("csZBar", "Unsupported camera parameter reported for flash mode: "+flashMode);
        }

        tryStartPreview();
    }

    @Override
    public void onPause ()
    {
        releaseCamera();
        super.onPause();
    }

    @Override
    public void onDestroy ()
    {
        if(scanner != null) scanner.destroy();
        super.onDestroy();
    }

    // Event handlers --------------------------------------------------

    @Override
    public void onBackPressed ()
    {
        setResult(RESULT_CANCELED);
        super.onBackPressed();
    }

    // SurfaceHolder.Callback implementation ---------------------------

    @Override
    public void surfaceCreated (SurfaceHolder hld)
    {
        tryStopPreview();
        holder = hld;
        tryStartPreview();
    }

    @Override
    public void surfaceDestroyed (SurfaceHolder holder)
    {
        // No surface == no preview == no point being in this Activity.
        die("The camera surface was destroyed");
    }

    @Override
    public void surfaceChanged (SurfaceHolder hld, int fmt, int w, int h)
    {
        // Sanity check - holder must have a surface...
        if(hld.getSurface() == null) die("There is no camera surface");

        surfW = w;
        surfH = h;
        matchSurfaceToPreviewRatio();

        tryStopPreview();
        holder = hld;
        tryStartPreview();
    }

    public void openDialogLogin(String title, String message) {
        onPause();

        // custom dialog
        final Dialog dialog = new Dialog(this); // Context, this, etc.
        dialog.setContentView(getResourceId("layout/dialog_login"));
        dialog.setCanceledOnTouchOutside(false);
        dialog.setTitle(title);

        // set the custom dialog components - text, image and button
        TextView text = (TextView) dialog.findViewById(getResourceId("id/dialog_login_info"));
        text.setText(message);

        Button dialogButtonOK = (Button) dialog.findViewById(getResourceId("id/dialog_login_ok"));
        dialogButtonOK.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                setResult(RESULT_STATE_LOGIN);
                finish();
            }
        });

        Button dialogButtonCancel = (Button) dialog.findViewById(getResourceId("id/dialog_login_cancel"));
        // if button is clicked, close the custom dialog
        dialogButtonCancel.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                dialog.dismiss();
                onResume();
            }
        });

        dialog.show();
    }


    public void openDialogPopup(String title, String message, final String param1, final String param2) {
        onPause();

        // custom dialog
        final Dialog dialog = new Dialog(this); // Context, this, etc.
        dialog.setContentView(getResourceId("layout/dialog_popup"));
        dialog.setCanceledOnTouchOutside(false);
        dialog.setTitle(title);

        // set the custom dialog components - text, image and button
        TextView text = (TextView) dialog.findViewById(getResourceId("id/dialog_popup_info"));
        text.setText(message);

        Button dialogButtonOK = (Button) dialog.findViewById(getResourceId("id/dialog_popup_ok"));
        // if button is clicked, close the custom dialog
        dialogButtonOK.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                dialog.dismiss();

                // Return 1st found QR code value to the calling Activity.
                Intent result = new Intent ();
                result.putExtra(EXTRA_QRVALUE, param1);
                result.putExtra(EXTRA_QRFORMAT, param2);
                result.putExtra(EXTRA_QROPEN, "true");
                setResult(Activity.RESULT_OK, result);
                finish();
            }
        });

        Button dialogButtonCancel = (Button) dialog.findViewById(getResourceId("id/dialog_popup_cancel"));
        // if button is clicked, close the custom dialog
        dialogButtonCancel.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                dialog.dismiss();

                // Return 1st found QR code value to the calling Activity.
                Intent result = new Intent ();
                result.putExtra(EXTRA_QRVALUE, param1);
                result.putExtra(EXTRA_QRFORMAT, param2);
                result.putExtra(EXTRA_QROPEN, "false");
                setResult(Activity.RESULT_OK, result);
                finish();
            }
        });

        dialog.show();
    }

    public void addListenerOnButton() {
        buttonMap = (ImageButton) findViewById(getResourceId("id/buttonMap"));
        buttonScan = (ImageButton) findViewById(getResourceId("id/buttonScan"));
        buttonSettings = (ImageButton) findViewById(getResourceId("id/buttonSettings"));
        buttonLogin = (ImageButton) findViewById(getResourceId("id/topBarDroite"));
        buttonFlash = (ImageButton) findViewById(getResourceId("id/buttonFlash"));
        buttonHelp = (ImageButton) findViewById(getResourceId("id/buttonHelp"));

        buttonMap.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View arg0) {
                if (isConnected) {
                    setResult(RESULT_STATE_MAP);
                    finish();
                } else {
                    openDialogLogin("Unavailable feature!",
                            "In order to access the map, you need to log in.");
                }
            }
        });

        buttonSettings.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View arg0) {
                if (isConnected) {
                    setResult(RESULT_STATE_SETTINGS);
                    finish();
                } else {
                    openDialogLogin("Unavailable feature!",
                            "In order to access settings, you need to log in.");
                }
            }
        });

        buttonLogin.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View arg0) {
                setResult(RESULT_STATE_LOGIN);
                finish();
            }
        });

        buttonFlash.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View arg0) {
                toggleFlash(arg0);
            }
        });

        buttonHelp.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View arg0) {
                setResult(RESULT_STATE_HELP);
                finish();
            }
        });
    }

    public void toggleFlash(View view) {
        camera.startPreview();
        android.hardware.Camera.Parameters camParams = camera.getParameters();

        //If the flash is set to off
        try {
            if (!camParams.getFlashMode().equals(Parameters.FLASH_MODE_TORCH)) {
                camParams.setFlashMode(Parameters.FLASH_MODE_TORCH);
            } else {
                camParams.setFlashMode(Parameters.FLASH_MODE_OFF);
            }
        }   catch(RuntimeException e) {

        }

        try {
            // camera.setParameters(camParams);
            camera.setPreviewDisplay(holder);
            camera.setPreviewCallback(previewCb);
            camera.startPreview();

            camera.setParameters(camParams);
        } catch(RuntimeException e) {
            Log.d("csZBar", (new StringBuilder("Unsupported camera parameter reported for flash mode: ")).append(flashMode).toString());
        } catch (IOException e) {
            Log.d("csZBar", (new StringBuilder("Wrong holder data")).append(flashMode).toString());
        }
    }

    // Continuously auto-focus -----------------------------------------
    // For API Level < 14

    private AutoFocusCallback autoFocusCb = new AutoFocusCallback()
    {
        public void onAutoFocus(boolean success, Camera camera) {
            // some devices crash without this try/catch and cancelAutoFocus()... (#9)
            try {
                camera.cancelAutoFocus();
                autoFocusHandler.postDelayed(doAutoFocus, autoFocusInterval);
            } catch (Exception e) {}
        }
    };

    private Runnable doAutoFocus = new Runnable()
    {
        public void run() {
            if(camera != null) camera.autoFocus(autoFocusCb);
        }
    };

    // Camera callbacks ------------------------------------------------

    // Receives frames from the camera and checks for barcodes.
    private PreviewCallback previewCb = new PreviewCallback()
    {
        public void onPreviewFrame(byte[] data, Camera camera) {
            Camera.Parameters parameters = camera.getParameters();
            Camera.Size size = parameters.getPreviewSize();

            Image barcode = new Image(size.width, size.height, "Y800");
            barcode.setData(data);

            if (scanner.scanImage(barcode) != 0) {
                String qrValue = "";
                String qrFormat = "";

                SymbolSet syms = scanner.getResults();
                for (Symbol sym : syms) {
                    qrValue = sym.getData();
                    qrFormat = (ZBarcodeFormat.getFormatById(sym.getType())).getName();

                    Pattern urlPattern = Pattern.compile(
                            "/^(http|https):\\/\\/.*.?qrtranslator.(com$|com\\/+.*)/",
                            Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL);
                    Matcher matcher = urlPattern.matcher(qrValue);

                    if (!matcher.find() && qrFormat.equals("QRCODE") && askOpen) {
                        openDialogPopup("External QRCode found!",
                                "Would you like to view the corresponding web page ?",
                                qrValue, qrFormat);
                    } else {
                        // Return 1st found QR code value to the calling Activity.
                        Intent result = new Intent ();
                        result.putExtra(EXTRA_QROPEN, "true");
                        result.putExtra(EXTRA_QRVALUE, qrValue);
                        result.putExtra(EXTRA_QRFORMAT, qrFormat);
                        setResult(Activity.RESULT_OK, result);
                        finish();
                    }

                }

            }
        }
    };

    // Misc ------------------------------------------------------------

    // finish() due to error
    private void die (String msg)
    {
        setResult(RESULT_ERROR);
        finish();
    }

    private int getResourceId (String typeAndName)
    {
        if(package_name == null) package_name = getApplication().getPackageName();
        if(resources == null) resources = getApplication().getResources();
        return resources.getIdentifier(typeAndName, null, package_name);
    }

    // Release the camera resources and state.
    private void releaseCamera ()
    {
        if (camera != null) {
            autoFocusHandler.removeCallbacks(doAutoFocus);
            camera.setPreviewCallback(null);
            camera.release();
            camera = null;
        }
    }

    // Match the aspect ratio of the preview SurfaceView with the camera's preview aspect ratio,
    // so that the displayed preview is not stretched/squashed.
    private void matchSurfaceToPreviewRatio () {
        if(camera == null) return;
        if(surfW == 0 || surfH == 0) return;

        // Resize SurfaceView to match camera preview ratio (avoid stretching).
        Camera.Parameters params = camera.getParameters();
        Camera.Size size = params.getPreviewSize();
        float previewRatio = (float) size.height / size.width; // swap h and w as the preview is rotated 90 degrees
        float surfaceRatio = (float) surfW / surfH;

        if(previewRatio > surfaceRatio) {
            scannerSurface.setLayoutParams(new FrameLayout.LayoutParams(
                    surfW,
                    Math.round((float) surfW / previewRatio),
                    Gravity.CENTER
            ));
        } else if(previewRatio < surfaceRatio) {
            scannerSurface.setLayoutParams(new FrameLayout.LayoutParams(
                    Math.round((float) surfH * previewRatio),
                    surfH,
                    Gravity.CENTER
            ));
        }
    }

    // Stop the camera preview safely.
    private void tryStopPreview () {
        // Stop camera preview before making changes.
        try {
            camera.stopPreview();
        } catch (Exception e){
            // Preview was not running. Ignore the error.
        }
    }

    public Collection<ZBarcodeFormat> getFormats() {
        if(mFormats == null) {
            return ZBarcodeFormat.ALL_FORMATS;
        }
        return mFormats;
    }


    // Start the camera preview if possible.
    // If start is attempted but fails, exit with error message.
    private void tryStartPreview () {
        if(holder != null) {
            try {
                // 90 degrees rotation for Portrait orientation Activity.
                camera.setDisplayOrientation(90);

                camera.setPreviewDisplay(holder);
                camera.setPreviewCallback(previewCb);
                camera.startPreview();

                if (android.os.Build.VERSION.SDK_INT >= 14) {
                    camera.autoFocus(autoFocusCb); // We are not using any of the
                    // continuous autofocus modes as that does not seem to work
                    // well with flash setting of "on"... At least with this
                    // simple and stupid focus method, we get to turn the flash
                    // on during autofocus.
                }
            } catch (IOException e) {
                die("Could not start camera preview: " + e.getMessage());
            }
        }
    }
}
