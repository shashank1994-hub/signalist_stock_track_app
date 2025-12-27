'use client'

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/inputField";
import SelectField from "@/components/forms/SelectField";
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from "@/lib/constants";
import CountrySelectField from "@/components/forms/CountrySelectField";
import FooterLink from "@/components/forms/FooterLink";
import { useRouter } from "next/navigation";
import { signUpWithEmail } from "@/lib/actions/auth.actions";
import { toast } from "sonner";

const SignUp = () => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            country: 'INDIA',
            investmentGoals: 'Growth',
            riskTolerance: 'Medium',
            preferredIndustry: 'Technology'
        },
        mode: 'onBlur'
    },);
    const onSubmit = async (data: SignUpFormData) => {
        try {
            const result = await signUpWithEmail(data);
            if (result.success) router.push('/');
        } catch (e) {
            console.error(e);
            toast.error('Sign up failed', {
                description: e instanceof Error ? e.message : 'Failed to create an account'
            })
        }
    }
    return (
        <>
            <h1 className="form-title">Sign-Up & Personalize</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="fullName"
                    label="Full Name"
                    placeholder="Shashank Jain"
                    register={register}
                    error={errors.fullName}
                    validation={{ required: 'Full name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } }}
                />
                <InputField
                    name="email"
                    label="Email"
                    placeholder="contact@gmail.com"
                    register={register}
                    error={errors.email}
                    validation={{ required: 'Email is required', pattern: { value: /^\w+@\w+\.\w+$/, message: 'Invalid email format' } }}
                />
                <InputField
                    name="password"
                    label="Password"
                    placeholder="Enter the Strong Password"
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{
                        required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' }, pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/,
                            message:
                                "Password must contain at least one uppercase letter, one lowercase letter, and one special character"
                        }
                    }}
                />
                {/*<CountrySelectField />*/}
                <SelectField
                    name="investmentGoals"
                    label={"Investment Goals"}
                    placeholder="Select Your Investment Goal"
                    options={INVESTMENT_GOALS}
                    control={control}
                    error={errors.investmentGoals}
                    required
                />
                <SelectField
                    name="riskTolerance"
                    label={"Risk Tolerance"}
                    placeholder="Select Your risk level"
                    options={RISK_TOLERANCE_OPTIONS}
                    control={control}
                    error={errors.riskTolerance}
                    required
                />
                <SelectField
                    name="preferredIndustry"
                    label={"Preferred Industry"}
                    placeholder="Select Your Preferred Industry"
                    options={PREFERRED_INDUSTRIES}
                    control={control}
                    error={errors.preferredIndustry}
                    required
                />

                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? 'Creating Account' : 'Start Your Investing Journey'}
                </Button>

                <FooterLink text="Already have an account" linkText="Sign in" href="sign-in" />
            </form>
        </>
    )
}
export default SignUp
